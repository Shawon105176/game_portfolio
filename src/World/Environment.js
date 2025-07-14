import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { gsap } from 'gsap'

export class Environment {
    constructor() {
        this.experience = window.experience || (typeof Experience !== 'undefined' ? Experience.instance : null)
        
        // Wait for experience to be ready
        if (!this.experience) {
            setTimeout(() => {
                this.experience = window.experience
                this.scene = this.experience.scene
                this.world = this.experience.world
                this.initialize()
            }, 100)
            return
        }
        
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.initialize()
    }
    
    initialize() {
        this.setLights()
        this.setGround()
        this.setTerrain()
        this.setBuildings()
        this.setTrees()
        this.setRoads()
        this.setZoneMarkers()
        this.setSkybox()
        this.setWater()
    }

    setLights() {
        // Bruno Simon style lighting setup
        this.ambientLight = new THREE.AmbientLight('#4ecdc4', 0.6)
        this.scene.add(this.ambientLight)

        // Main directional light (sun)
        this.directionalLight = new THREE.DirectionalLight('#ff6b9d', 1.2)
        this.directionalLight.position.set(50, 50, 25)
        this.directionalLight.castShadow = true
        this.directionalLight.shadow.mapSize.set(4096, 4096)
        this.directionalLight.shadow.camera.near = 1
        this.directionalLight.shadow.camera.far = 200
        this.directionalLight.shadow.camera.left = -100
        this.directionalLight.shadow.camera.right = 100
        this.directionalLight.shadow.camera.top = 100
        this.directionalLight.shadow.camera.bottom = -100
        this.scene.add(this.directionalLight)

        // Secondary light for rim lighting
        this.rimLight = new THREE.DirectionalLight('#4ecdc4', 0.8)
        this.rimLight.position.set(-30, 20, -30)
        this.scene.add(this.rimLight)

        // Hemisphere light for natural ambient
        this.hemisphereLight = new THREE.HemisphereLight('#ff6b9d', '#4ecdc4', 0.4)
        this.scene.add(this.hemisphereLight)

        // Add some point lights for accent
        this.createAccentLights()
    }

    createAccentLights() {
        const lightPositions = [
            { x: -20, y: 10, z: -20, color: '#ff6b9d' },
            { x: 20, y: 8, z: -20, color: '#4ecdc4' },
            { x: 0, y: 12, z: -40, color: '#45b7d1' }
        ]

        lightPositions.forEach(light => {
            const pointLight = new THREE.PointLight(light.color, 1, 30)
            pointLight.position.set(light.x, light.y, light.z)
            this.scene.add(pointLight)

            // Create light orb visual
            const orbGeometry = new THREE.SphereGeometry(0.3, 16, 16)
            const orbMaterial = new THREE.MeshBasicMaterial({
                color: light.color,
                emissive: light.color,
                emissiveIntensity: 0.8
            })
            
            const orb = new THREE.Mesh(orbGeometry, orbMaterial)
            orb.position.copy(pointLight.position)
            this.scene.add(orb)

            // Animate light intensity
            gsap.to(pointLight, {
                intensity: 0.3,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "power2.inOut"
            })
        })
    }

    setGround() {
        // Bruno Simon style animated ground with hexagonal tiles
        this.createHexagonalGround()
        this.createFloatingIslands()
    }

    createHexagonalGround() {
        // Create hexagonal tile pattern like Bruno Simon's portfolio
        const hexSize = 2
        const hexCount = 30
        this.hexagons = []

        for (let x = -hexCount; x <= hexCount; x++) {
            for (let z = -hexCount; z <= hexCount; z++) {
                // Skip some hexagons for organic look
                if (Math.random() > 0.85) continue

                const hexGeometry = new THREE.CylinderGeometry(hexSize, hexSize, 0.2, 6)
                const hexMaterial = new THREE.MeshStandardMaterial({
                    color: this.getHexColor(x, z),
                    roughness: 0.3,
                    metalness: 0.1,
                    transparent: true,
                    opacity: 0.9
                })

                const hex = new THREE.Mesh(hexGeometry, hexMaterial)
                
                // Hexagonal grid positioning
                const offsetX = x * hexSize * 1.5
                const offsetZ = z * hexSize * Math.sqrt(3) + (x % 2) * hexSize * Math.sqrt(3) / 2
                
                hex.position.set(offsetX, Math.random() * 0.5, offsetZ)
                hex.receiveShadow = true
                hex.castShadow = true
                
                this.scene.add(hex)
                this.hexagons.push({
                    mesh: hex,
                    originalY: hex.position.y,
                    delay: Math.random() * 2
                })

                // Add subtle floating animation
                gsap.to(hex.position, {
                    y: hex.position.y + 0.3,
                    duration: 2 + Math.random(),
                    delay: Math.random() * 2,
                    yoyo: true,
                    repeat: -1,
                    ease: "power2.inOut"
                })

                // Add rotation animation
                gsap.to(hex.rotation, {
                    y: Math.PI * 2,
                    duration: 10 + Math.random() * 5,
                    repeat: -1,
                    ease: "none"
                })
            }
        }

        // Create main ground plane
        const groundGeometry = new THREE.PlaneGeometry(400, 400)
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: '#1a1a2e',
            roughness: 0.9,
            metalness: 0.1
        })

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial)
        this.ground.rotation.x = -Math.PI / 2
        this.ground.position.y = -1
        this.ground.receiveShadow = true
        this.scene.add(this.ground)

        // Physics ground
        const groundShape = new CANNON.Plane()
        this.groundBody = new CANNON.Body({ 
            mass: 0,
            material: this.world.groundMaterial 
        })
        this.groundBody.addShape(groundShape)
        this.groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
        this.world.instance.addBody(this.groundBody)
    }

    setTerrain() {
        // Create some hills in the background
        const hillPositions = [
            { x: -80, z: -80, height: 15 },
            { x: 80, z: -80, height: 12 },
            { x: -60, z: 60, height: 18 },
            { x: 90, z: 70, height: 20 }
        ]

        hillPositions.forEach(hill => {
            const hillGeometry = new THREE.SphereGeometry(25, 16, 16)
            const hillMaterial = new THREE.MeshStandardMaterial({
                color: '#4CAF50',
                roughness: 0.9
            })
            
            const hillMesh = new THREE.Mesh(hillGeometry, hillMaterial)
            hillMesh.position.set(hill.x, hill.height / 2, hill.z)
            hillMesh.scale.y = 0.3
            hillMesh.receiveShadow = true
            this.scene.add(hillMesh)
        })
    }

    setBuildings() {
        const buildingData = [
            { x: -30, z: -30, width: 6, height: 15, depth: 6, color: '#FF5722' },
            { x: -20, z: -35, width: 4, height: 12, depth: 8, color: '#2196F3' },
            { x: 25, z: -25, width: 8, height: 20, depth: 5, color: '#9C27B0' },
            { x: 30, z: -35, width: 5, height: 18, depth: 7, color: '#FF9800' },
            { x: -35, z: 25, width: 7, height: 16, depth: 6, color: '#4CAF50' },
            { x: 25, z: 30, width: 6, height: 14, depth: 9, color: '#F44336' }
        ]

        buildingData.forEach(building => {
            const buildingGeometry = new THREE.BoxGeometry(building.width, building.height, building.depth)
            const buildingMaterial = new THREE.MeshStandardMaterial({
                color: building.color,
                roughness: 0.7,
                metalness: 0.1
            })

            const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial)
            buildingMesh.position.set(building.x, building.height / 2, building.z)
            buildingMesh.castShadow = true
            buildingMesh.receiveShadow = true
            this.scene.add(buildingMesh)

            // Add physics body for collision
            const buildingShape = new CANNON.Box(new CANNON.Vec3(
                building.width / 2,
                building.height / 2,
                building.depth / 2
            ))
            const buildingBody = new CANNON.Body({ 
                mass: 0,
                material: this.world.obstacleMaterial 
            })
            buildingBody.addShape(buildingShape)
            buildingBody.position.set(building.x, building.height / 2, building.z)
            this.world.instance.addBody(buildingBody)

            // Add windows
            this.addWindows(buildingMesh, building)
        })
    }

    addWindows(building, buildingData) {
        const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2)
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: '#87CEEB',
            transparent: true,
            opacity: 0.7,
            emissive: '#FFD700',
            emissiveIntensity: 0.1
        })

        const windowsPerFloor = Math.floor(buildingData.width / 2)
        const floors = Math.floor(buildingData.height / 3)

        for (let floor = 0; floor < floors; floor++) {
            for (let window = 0; window < windowsPerFloor; window++) {
                if (Math.random() > 0.7) continue // Some windows are dark

                const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial)
                windowMesh.position.set(
                    (window - windowsPerFloor / 2) * 1.5,
                    floor * 3 - buildingData.height / 2 + 2,
                    buildingData.depth / 2 + 0.01
                )
                building.add(windowMesh)
            }
        }
    }

    setTrees() {
        const treePositions = [
            { x: -15, z: -10 }, { x: -12, z: -8 }, { x: -18, z: -12 },
            { x: 15, z: -8 }, { x: 18, z: -15 }, { x: 12, z: -12 },
            { x: -10, z: 15 }, { x: -8, z: 18 }, { x: -15, z: 20 },
            { x: 10, z: 12 }, { x: 15, z: 15 }, { x: 8, z: 20 },
            { x: -45, z: -45 }, { x: 45, z: -45 }, { x: -45, z: 45 }, { x: 45, z: 45 }
        ]

        treePositions.forEach(pos => {
            this.createTree(pos.x, pos.z)
        })
    }

    createTree(x, z) {
        const treeGroup = new THREE.Group()

        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8)
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#8B4513' })
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
        trunk.position.y = 2
        trunk.castShadow = true
        treeGroup.add(trunk)

        // Tree leaves (multiple spheres for more natural look)
        const leafMaterial = new THREE.MeshStandardMaterial({ color: '#228B22' })
        
        for (let i = 0; i < 3; i++) {
            const leafGeometry = new THREE.SphereGeometry(1.5 + Math.random(), 8, 8)
            const leaves = new THREE.Mesh(leafGeometry, leafMaterial)
            leaves.position.set(
                (Math.random() - 0.5) * 2,
                4 + i * 1.5 + Math.random(),
                (Math.random() - 0.5) * 2
            )
            leaves.castShadow = true
            treeGroup.add(leaves)
        }

        treeGroup.position.set(x, 0, z)
        this.scene.add(treeGroup)

        // Add physics collision for trunk only
        const trunkShape = new CANNON.Cylinder(0.5, 0.3, 4, 8)
        const trunkBody = new CANNON.Body({ 
            mass: 0,
            material: this.world.obstacleMaterial 
        })
        trunkBody.addShape(trunkShape)
        trunkBody.position.set(x, 2, z)
        this.world.instance.addBody(trunkBody)
    }

    setRoads() {
        // Main road
        const roadGeometry = new THREE.PlaneGeometry(6, 100)
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: '#2F2F2F',
            roughness: 0.9
        })

        const mainRoad = new THREE.Mesh(roadGeometry, roadMaterial)
        mainRoad.rotation.x = -Math.PI / 2
        mainRoad.position.y = 0.01
        mainRoad.receiveShadow = true
        this.scene.add(mainRoad)

        // Cross road
        const crossRoad = new THREE.Mesh(roadGeometry, roadMaterial)
        crossRoad.rotation.x = -Math.PI / 2
        crossRoad.rotation.z = Math.PI / 2
        crossRoad.position.y = 0.01
        crossRoad.receiveShadow = true
        this.scene.add(crossRoad)

        // Road markings
        this.addRoadMarkings()
    }

    addRoadMarkings() {
        const markingGeometry = new THREE.PlaneGeometry(0.3, 3)
        const markingMaterial = new THREE.MeshStandardMaterial({
            color: '#FFFFFF'
        })

        // Center line markings
        for (let i = -40; i < 40; i += 8) {
            const marking = new THREE.Mesh(markingGeometry, markingMaterial)
            marking.rotation.x = -Math.PI / 2
            marking.position.set(0, 0.02, i)
            this.scene.add(marking)
        }

        // Cross road markings
        for (let i = -40; i < 40; i += 8) {
            const marking = new THREE.Mesh(markingGeometry, markingMaterial)
            marking.rotation.x = -Math.PI / 2
            marking.rotation.z = Math.PI / 2
            marking.position.set(i, 0.02, 0)
            this.scene.add(marking)
        }
    }

    setZoneMarkers() {
        const zones = [
            { name: 'PROJECTS', position: [-20, 1, -20], color: '#FF4757' },
            { name: 'ABOUT', position: [20, 1, -20], color: '#3742FA' },
            { name: 'CONTACT', position: [0, 1, -40], color: '#2ED573' }
        ]

        zones.forEach(zone => {
            // Create floating platform
            const platformGeometry = new THREE.CylinderGeometry(6, 6, 0.5, 16)
            const platformMaterial = new THREE.MeshStandardMaterial({
                color: zone.color,
                emissive: zone.color,
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.8
            })
            
            const platform = new THREE.Mesh(platformGeometry, platformMaterial)
            platform.position.set(...zone.position)
            platform.castShadow = true
            platform.receiveShadow = true
            this.scene.add(platform)

            // Add floating animation
            gsap.to(platform.position, {
                y: zone.position[1] + 0.5,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "power2.inOut"
            })

            // Create text label
            this.createTextLabel(zone.name, zone.position, zone.color)

            // Create glowing effect
            this.createGlowEffect(platform, zone.color)
        })
    }

    createTextLabel(text, position, color) {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = 512
        canvas.height = 128
        
        context.fillStyle = color
        context.font = 'Bold 48px Arial'
        context.textAlign = 'center'
        context.fillText(text, 256, 80)
        
        const texture = new THREE.CanvasTexture(canvas)
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        })
        
        const labelGeometry = new THREE.PlaneGeometry(8, 2)
        const label = new THREE.Mesh(labelGeometry, labelMaterial)
        label.position.set(position[0], position[1] + 3, position[2])
        this.scene.add(label)

        // Make label always face camera
        label.lookAt = () => {
            if (this.experience.camera) {
                label.lookAt(this.experience.camera.position)
            }
        }

        // Store for later updates
        if (!this.labels) this.labels = []
        this.labels.push(label)
    }

    createGlowEffect(object, color) {
        // Create a larger, transparent version for glow effect
        const glowGeometry = object.geometry.clone()
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        })
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        glow.scale.setScalar(1.2)
        object.add(glow)
    }

    setSkybox() {
        // Bruno Simon style gradient skybox with stars
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32)
        const skyMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform vec3 accentColor;
                uniform float time;
                varying vec3 vWorldPosition;
                
                // Simple noise function
                float noise(vec3 p) {
                    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
                }
                
                void main() {
                    float h = normalize(vWorldPosition).y;
                    
                    // Create gradient
                    vec3 color = mix(bottomColor, topColor, max(h, 0.0));
                    
                    // Add some stars
                    vec3 starPos = vWorldPosition * 0.01;
                    float star = noise(floor(starPos));
                    if (star > 0.99) {
                        color += accentColor * 0.8;
                    }
                    
                    // Add subtle animation
                    color += accentColor * 0.1 * sin(time * 0.001 + h * 3.14159);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            uniforms: {
                topColor: { value: new THREE.Color('#ff6b9d') },
                bottomColor: { value: new THREE.Color('#1a1a2e') },
                accentColor: { value: new THREE.Color('#4ecdc4') },
                time: { value: 0 }
            },
            side: THREE.BackSide
        })

        this.skybox = new THREE.Mesh(skyGeometry, skyMaterial)
        this.scene.add(this.skybox)

        // Animate skybox
        const animateSky = () => {
            skyMaterial.uniforms.time.value = Date.now()
            requestAnimationFrame(animateSky)
        }
        animateSky()
    }

    setWater() {
        // Create a water area
        const waterGeometry = new THREE.PlaneGeometry(30, 30)
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: '#0077BE',
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.9
        })

        this.water = new THREE.Mesh(waterGeometry, waterMaterial)
        this.water.rotation.x = -Math.PI / 2
        this.water.position.set(60, 0.1, 60)
        this.water.receiveShadow = true
        this.scene.add(this.water)

        // Animate water
        this.animateWater()
    }

    animateWater() {
        if (this.water) {
            gsap.to(this.water.material, {
                opacity: 0.6,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "power2.inOut"
            })
        }
    }

    update() {
        // Update label rotations to face camera
        if (this.labels) {
            this.labels.forEach(label => {
                if (label.lookAt) {
                    label.lookAt()
                }
            })
        }
    }

    getHexColor(x, z) {
        // Color variation based on position (Bruno Simon style)
        const distance = Math.sqrt(x * x + z * z)
        const hue = (distance * 10 + Date.now() * 0.0001) % 360
        return `hsl(${hue}, 70%, 60%)`
    }

    createFloatingIslands() {
        // Create floating islands like Bruno Simon's portfolio
        const islandPositions = [
            { x: -40, y: 5, z: -40, size: 8 },
            { x: 40, y: 4, z: -40, size: 6 },
            { x: 0, y: 6, z: -60, size: 10 },
            { x: -30, y: 3, z: 30, size: 7 },
            { x: 35, y: 5, z: 35, size: 9 }
        ]

        islandPositions.forEach((island, index) => {
            const islandGroup = new THREE.Group()
            
            // Main island body
            const islandGeometry = new THREE.SphereGeometry(island.size, 16, 16)
            const islandMaterial = new THREE.MeshStandardMaterial({
                color: '#4ecdc4',
                roughness: 0.7,
                metalness: 0.2
            })
            
            const islandMesh = new THREE.Mesh(islandGeometry, islandMaterial)
            islandMesh.scale.y = 0.4
            islandMesh.castShadow = true
            islandMesh.receiveShadow = true
            islandGroup.add(islandMesh)

            // Add floating crystals on islands
            for (let i = 0; i < 3; i++) {
                const crystalGeometry = new THREE.OctahedronGeometry(0.5 + Math.random())
                const crystalMaterial = new THREE.MeshStandardMaterial({
                    color: `hsl(${180 + Math.random() * 60}, 80%, 70%)`,
                    emissive: `hsl(${180 + Math.random() * 60}, 50%, 20%)`,
                    transparent: true,
                    opacity: 0.8
                })
                
                const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial)
                crystal.position.set(
                    (Math.random() - 0.5) * island.size,
                    island.size * 0.3 + Math.random() * 2,
                    (Math.random() - 0.5) * island.size
                )
                
                islandGroup.add(crystal)

                // Rotate crystals
                gsap.to(crystal.rotation, {
                    y: Math.PI * 2,
                    duration: 5 + Math.random() * 3,
                    repeat: -1,
                    ease: "none"
                })
            }

            islandGroup.position.set(island.x, island.y, island.z)
            this.scene.add(islandGroup)

            // Floating animation
            gsap.to(islandGroup.position, {
                y: island.y + 2,
                duration: 4 + index,
                yoyo: true,
                repeat: -1,
                ease: "power2.inOut"
            })

            // Slow rotation
            gsap.to(islandGroup.rotation, {
                y: Math.PI * 2,
                duration: 20 + index * 5,
                repeat: -1,
                ease: "none"
            })
        })
    }
}
