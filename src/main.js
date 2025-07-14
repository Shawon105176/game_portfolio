import '../style.css'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { gsap } from 'gsap'
import Stats from 'stats.js'

import { World } from './World/World.js'
import { Car } from './World/Car.js'
import { Environment } from './World/Environment.js'
import { UI } from './UI/UI.js'
import { AudioManager } from './Audio/AudioManager.js'
import { LoadingManager } from './Utils/LoadingManager.js'

class Experience {
    constructor() {
        // Singleton
        if (Experience.instance) {
            return Experience.instance
        }
        Experience.instance = this

        // Options
        this.canvas = document.querySelector('#webgl-canvas')
        this.debug = window.location.hash === '#debug'
        
        // Setup
        this.setStats()
        this.setLoadingManager()
        this.setScene()
        this.setRenderer()
        this.setCamera()
        this.setWorld()
        this.setUI()
        this.setAudio()
        this.setControls()
        this.setTime()
        this.resize()

        // Start loading
        this.loadingManager.startLoading()
    }

    setStats() {
        if (this.debug) {
            this.stats = new Stats()
            this.stats.showPanel(0)
            document.body.appendChild(this.stats.dom)
        }
    }

    setLoadingManager() {
        this.loadingManager = new LoadingManager()
        this.loadingManager.on('loaded', () => {
            this.onLoaded()
        })
    }

    setScene() {
        this.scene = new THREE.Scene()
        this.scene.fog = new THREE.Fog('#1a1a2e', 30, 150)
    }

    setRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setClearColor('#1a1a2e')
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1.2
        
        // Add bloom effect
        this.renderer.shadowMap.autoUpdate = true
        this.renderer.physicallyCorrectLights = true
    }

    setCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.set(0, 15, 20)
        this.scene.add(this.camera)

        // Camera target for smooth following
        this.cameraTarget = new THREE.Vector3()
        this.cameraPosition = new THREE.Vector3()
    }

    setWorld() {
        this.world = new World()
        this.environment = new Environment()
        this.car = new Car()
        
        // Make Experience instance available globally
        window.experience = this
    }

    setUI() {
        this.ui = new UI()
    }

    setAudio() {
        this.audioManager = new AudioManager()
    }

    setControls() {
        this.keys = {}
        
        // Keyboard events
        window.addEventListener('keydown', (event) => {
            this.keys[event.code] = true
        })

        window.addEventListener('keyup', (event) => {
            this.keys[event.code] = false
        })

        // Mouse events for camera control
        this.mouse = new THREE.Vector2()
        this.isMouseDown = false

        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        })

        window.addEventListener('mousedown', () => {
            this.isMouseDown = true
        })

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false
        })

        // Touch events for mobile
        this.setupTouchControls()
    }

    setupTouchControls() {
        let touchStartX = 0
        let touchStartY = 0

        window.addEventListener('touchstart', (event) => {
            const touch = event.touches[0]
            touchStartX = touch.clientX
            touchStartY = touch.clientY
        })

        window.addEventListener('touchmove', (event) => {
            event.preventDefault()
            const touch = event.touches[0]
            const deltaX = touch.clientX - touchStartX
            const deltaY = touch.clientY - touchStartY

            // Simple touch steering
            if (Math.abs(deltaX) > 50) {
                this.keys['ArrowLeft'] = deltaX < 0
                this.keys['ArrowRight'] = deltaX > 0
            }

            if (deltaY < -50) {
                this.keys['ArrowUp'] = true
            } else if (deltaY > 50) {
                this.keys['ArrowDown'] = true
            }
        })

        window.addEventListener('touchend', () => {
            this.keys['ArrowLeft'] = false
            this.keys['ArrowRight'] = false
            this.keys['ArrowUp'] = false
            this.keys['ArrowDown'] = false
        })
    }

    setTime() {
        this.time = {}
        this.time.start = Date.now()
        this.time.current = this.time.start
        this.time.elapsed = 0
        this.time.delta = 16

        this.time.tick = () => {
            const currentTime = Date.now()
            this.time.delta = currentTime - this.time.current
            this.time.current = currentTime
            this.time.elapsed = this.time.current - this.time.start

            this.update()
            requestAnimationFrame(this.time.tick)
        }

        this.time.tick()
    }

    onLoaded() {
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen')
        loadingScreen.classList.add('hidden')
        
        setTimeout(() => {
            loadingScreen.style.display = 'none'
        }, 500)

        // Start the experience
        this.audioManager.playAmbientMusic()
        this.ui.showWelcomeMessage()
    }

    updateCamera() {
        if (this.car && this.car.mesh) {
            // Get car position and rotation
            const carPosition = this.car.mesh.position
            const carRotation = this.car.mesh.rotation

            // Calculate camera position behind and above the car
            const cameraOffset = new THREE.Vector3(0, 8, 15)
            cameraOffset.applyEuler(carRotation)
            this.cameraPosition.copy(carPosition).add(cameraOffset)

            // Calculate camera target (slightly ahead of the car)
            const targetOffset = new THREE.Vector3(0, 2, -5)
            targetOffset.applyEuler(carRotation)
            this.cameraTarget.copy(carPosition).add(targetOffset)

            // Smooth camera movement
            this.camera.position.lerp(this.cameraPosition, 0.1)
            this.camera.lookAt(this.cameraTarget)

            // Add some mouse-controlled camera offset
            if (this.isMouseDown) {
                const mouseOffset = new THREE.Vector3(this.mouse.x * 5, this.mouse.y * 3, 0)
                this.camera.position.add(mouseOffset)
            }
        }
    }

    update() {
        if (this.debug && this.stats) {
            this.stats.begin()
        }

        // Update world physics
        if (this.world) {
            this.world.update(this.time.delta)
        }

        // Update car
        if (this.car) {
            this.car.update(this.keys, this.time.delta)
        }

        // Update camera
        this.updateCamera()

        // Update UI
        if (this.ui) {
            this.ui.update(this.car)
        }

        // Update audio
        if (this.audioManager) {
            this.audioManager.update(this.car)
        }

        // Render
        this.renderer.render(this.scene, this.camera)

        if (this.debug && this.stats) {
            this.stats.end()
        }
    }

    resize() {
        window.addEventListener('resize', () => {
            // Update camera
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()

            // Update renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight)
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })
    }

    destroy() {
        this.renderer.dispose()
        this.scene.clear()
        
        if (this.world) {
            this.world.destroy()
        }
        
        if (this.audioManager) {
            this.audioManager.destroy()
        }
    }
}

// Initialize the experience
new Experience()
