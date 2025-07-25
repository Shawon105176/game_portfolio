import '../style.css'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { gsap } from 'gsap'
import Stats from 'stats.js'

import { World } from './World/World.js'
import { Car } from './World/Car.js'
import { Environment } from './World/Environment.js'
import { UI } from './UI/EnhancedUI.js'
import { AudioManager } from './Audio/EnhancedAudioManager.js'
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
        this.mousePressed = false
        this.hasStarted = false
        
        // Key events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true
            
            // Hide central message on first interaction
            if (!this.hasStarted) {
                this.hasStarted = true
                document.body.classList.add('started')
            }
            
            // Reset car on R key
            if (e.code === 'KeyR') {
                window.dispatchEvent(new Event('resetCar'))
            }
        })
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false
        })
        
        // Mouse events
        window.addEventListener('mousedown', (e) => {
            this.mousePressed = true
            
            // Hide central message on first interaction
            if (!this.hasStarted) {
                this.hasStarted = true
                document.body.classList.add('started')
            }
        })
        
        window.addEventListener('mouseup', () => {
            this.mousePressed = false
        })
        
        window.addEventListener('mousemove', (e) => {
            if (this.mousePressed) {
                // Camera rotation logic would go here
                const sensitivity = 0.002
                this.cameraOffset.x += e.movementX * sensitivity
                this.cameraOffset.y += e.movementY * sensitivity
                this.cameraOffset.y = Math.max(-Math.PI/4, Math.min(Math.PI/4, this.cameraOffset.y))
            }
        })
        
        // Touch events for mobile
        window.addEventListener('touchstart', () => {
            if (!this.hasStarted) {
                this.hasStarted = true
                document.body.classList.add('started')
            }
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
        if (this.car && this.car.group) {
            // Get car position and rotation
            const carPosition = this.car.group.position
            const carRotation = this.car.group.rotation

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
