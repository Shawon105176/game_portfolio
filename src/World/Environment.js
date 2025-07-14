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
        this.setZoneMarkers()
        this.setSkybox()
        this.setLearningResources() // Add learning resources section
        this.setupInteractions()
    }

    setLights() {
        // Orange theme lighting setup
        this.ambientLight = new THREE.AmbientLight('#ffb347', 0.8)
        this.scene.add(this.ambientLight)

        // Main directional light (warm sun)
        this.directionalLight = new THREE.DirectionalLight('#ff7f00', 1.5)
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

        // Secondary light for warm lighting
        this.rimLight = new THREE.DirectionalLight('#ffd700', 0.6)
        this.rimLight.position.set(-30, 20, -30)
        this.scene.add(this.rimLight)

        // Hemisphere light for natural warm ambient
        this.hemisphereLight = new THREE.HemisphereLight('#ff9500', '#ffb347', 0.5)
        this.scene.add(this.hemisphereLight)

        // Add some point lights for accent
        this.createAccentLights()
    }

    createAccentLights() {
        const lightPositions = [
            { x: -20, y: 10, z: -20, color: '#ff7f00' },
            { x: 20, y: 8, z: -20, color: '#ffd700' },
            { x: 0, y: 12, z: -40, color: '#ffb347' },
            { x: -10, y: 6, z: 10, color: '#ff9500' },
            { x: 15, y: 8, z: 15, color: '#ff6b47' }
        ]

        lightPositions.forEach(light => {
            const pointLight = new THREE.PointLight(light.color, 1.2, 25)
            pointLight.position.set(light.x, light.y, light.z)
            this.scene.add(pointLight)

            // Create light orb visual
            const orbGeometry = new THREE.SphereGeometry(0.4, 16, 16)
            const orbMaterial = new THREE.MeshBasicMaterial({
                color: light.color,
                emissive: light.color,
                emissiveIntensity: 1.0
            })
            
            const orb = new THREE.Mesh(orbGeometry, orbMaterial)
            orb.position.copy(pointLight.position)
            this.scene.add(orb)

            // Animate light intensity
            gsap.to(pointLight, {
                intensity: 0.5,
                duration: 1.5,
                yoyo: true,
                repeat: -1,
                ease: "power2.inOut"
            })

            // Add floating animation to orbs
            gsap.to(orb.position, {
                y: orb.position.y + 2,
                duration: 3,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            })
        })
    }

    setGround() {
        // Create flat orange ground like first image
        this.createFlatGround()
        this.createScatteredObjects()
        this.addTextLabels()
    }

    createFlatGround() {
        // Large flat ground plane - orange like in the reference
        const groundGeometry = new THREE.PlaneGeometry(400, 400)
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: '#ff7f00',
            roughness: 0.8,
            metalness: 0.1
        })
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial)
        ground.rotation.x = -Math.PI / 2
        ground.position.y = 0
        ground.receiveShadow = true
        this.scene.add(ground)

        // Add physics ground
        const groundShape = new CANNON.Plane()
        const groundBody = new CANNON.Body({ mass: 0 })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
        this.world.instance.addBody(groundBody)
    }

    createScatteredObjects() {
        // Create scattered objects like in the first image
        const objectTypes = [
            { type: 'box', size: [2, 3, 2], color: '#90ee90' },      // Green boxes (trees)
            { type: 'box', size: [1, 1, 1], color: '#ffffff' },      // White cubes
            { type: 'box', size: [4, 0.5, 4], color: '#ffffff' },    // White platforms
            { type: 'cylinder', size: [0.1, 4, 0.1], color: '#8b4513' }, // Flagpoles
            { type: 'box', size: [1.5, 1.5, 1.5], color: '#dda0dd' } // Purple boxes
        ]

        // Create grid-like arrangement like in the first image
        const positions = [
            // Left side objects
            { x: -20, z: -15 }, { x: -25, z: -10 }, { x: -15, z: -20 },
            { x: -30, z: -5 }, { x: -18, z: -8 }, { x: -22, z: -18 },
            
            // Center area (keep clear for driving)
            { x: -5, z: -15 }, { x: 5, z: -12 }, { x: -3, z: -8 },
            
            // Right side objects  
            { x: 15, z: -10 }, { x: 20, z: -15 }, { x: 25, z: -8 },
            { x: 18, z: -20 }, { x: 22, z: -5 }, { x: 30, z: -12 },
            
            // Background objects
            { x: -10, z: -25 }, { x: 0, z: -30 }, { x: 10, z: -28 },
            { x: -20, z: -30 }, { x: 20, z: -32 }
        ]

        positions.forEach((pos, index) => {
            const objectData = objectTypes[index % objectTypes.length]
            let geometry, mesh

            switch (objectData.type) {
                case 'box':
                    geometry = new THREE.BoxGeometry(...objectData.size)
                    break
                case 'cylinder':
                    geometry = new THREE.CylinderGeometry(objectData.size[0], objectData.size[0], objectData.size[1], 8)
                    break
                default:
                    geometry = new THREE.BoxGeometry(1, 1, 1)
            }

            const material = new THREE.MeshStandardMaterial({
                color: objectData.color,
                roughness: 0.4,
                metalness: 0.1
            })

            mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(pos.x, objectData.size[1] / 2, pos.z)
            mesh.castShadow = true
            mesh.receiveShadow = true
            this.scene.add(mesh)

            // Add physics body
            let shape
            if (objectData.type === 'box') {
                shape = new CANNON.Box(new CANNON.Vec3(...objectData.size.map(s => s / 2)))
            } else if (objectData.type === 'cylinder') {
                shape = new CANNON.Cylinder(objectData.size[0], objectData.size[0], objectData.size[1], 8)
            }

            const body = new CANNON.Body({ mass: 0 })
            body.addShape(shape)
            body.position.set(pos.x, objectData.size[1] / 2, pos.z)
            this.world.instance.addBody(body)

            // Add some random rotation
            mesh.rotation.y = Math.random() * Math.PI * 2
        })
    }

    addTextLabels() {
        // Add text on the ground like in the first image
        const textData = [
            { text: 'ACTIVITIES', position: { x: -25, z: -12 } },
            { text: 'PLAYGROUND', position: { x: 0, z: -20 } },
            { text: 'CREATIONS', position: { x: 20, z: -15 } }
        ]

        textData.forEach(data => {
            // Create text using simple geometry (since we don't have font loading)
            const textGeometry = new THREE.PlaneGeometry(8, 2)
            const textMaterial = new THREE.MeshBasicMaterial({
                color: '#ffffff',
                transparent: true,
                opacity: 0.9
            })
            
            const textMesh = new THREE.Mesh(textGeometry, textMaterial)
            textMesh.rotation.x = -Math.PI / 2
            textMesh.position.set(data.position.x, 0.1, data.position.z)
            this.scene.add(textMesh)
        })
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
                color: '#ff8c42',
                roughness: 0.8,
                metalness: 0.1
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
                topColor: { value: new THREE.Color('#ffd700') },
                bottomColor: { value: new THREE.Color('#ff7f00') },
                accentColor: { value: new THREE.Color('#ffb347') },
                time: { value: 0 }
            },
            side: THREE.BackSide
        })

        this.skybox = new THREE.Mesh(skyGeometry, skyMaterial)
        this.scene.add(this.skybox)
        
        // Update the skybox time uniform in animation
        if (this.experience.time) {
            this.experience.time.on('tick', () => {
                skyMaterial.uniforms.time.value = this.experience.time.elapsed
            })
        } else {
            // Fallback animation if time module is not available
            const animate = () => {
                skyMaterial.uniforms.time.value = Date.now()
                requestAnimationFrame(animate)
            }
            animate()
        }
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
        // Orange theme color variation based on position
        const distance = Math.sqrt(x * x + z * z)
        const colors = [
            '#ff7f00', // Primary orange
            '#ff9500', // Secondary orange  
            '#ffb347', // Light orange
            '#ffd700', // Gold yellow
            '#ff6b47', // Warm red
            '#ffcc99'  // Cream orange
        ]
        
        const colorIndex = Math.floor((distance * 2 + x + z) % colors.length)
        return colors[colorIndex]
    }

    createFloatingIslands() {
        // Create floating islands with colorful objects like in the reference image
        const islandPositions = [
            { x: -40, y: 5, z: -40, size: 8, color: '#90ee90' },
            { x: 40, y: 4, z: -40, size: 6, color: '#ffd700' },
            { x: 0, y: 6, z: -60, size: 10, color: '#ff6b47' },
            { x: -30, y: 3, z: 30, size: 7, color: '#ffb347' },
            { x: 35, y: 5, z: 35, size: 9, color: '#ff9500' }
        ]

        islandPositions.forEach((island, index) => {
            const islandGroup = new THREE.Group()
            
            // Main island body
            const islandGeometry = new THREE.SphereGeometry(island.size, 16, 16)
            const islandMaterial = new THREE.MeshStandardMaterial({
                color: island.color,
                roughness: 0.4,
                metalness: 0.1
            })
            
            const islandMesh = new THREE.Mesh(islandGeometry, islandMaterial)
            islandMesh.scale.y = 0.4
            islandMesh.castShadow = true
            islandMesh.receiveShadow = true
            islandGroup.add(islandMesh)

            // Add colorful 3D objects like in the reference image
            this.addIslandObjects(islandGroup, island)

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

            // Add physics body
            const islandShape = new CANNON.Sphere(island.size)
            const islandBody = new CANNON.Body({ mass: 0 })
            islandBody.addShape(islandShape)
            islandBody.position.set(island.x, island.y, island.z)
            this.world.instance.addBody(islandBody)
        })
    }

    addIslandObjects(islandGroup, island) {
        // Add various colorful 3D objects
        const objectTypes = ['cube', 'cylinder', 'cone', 'sphere', 'torus']
        const objectColors = ['#ff7f00', '#ffd700', '#90ee90', '#ff6b47', '#ffb347', '#87ceeb', '#dda0dd']

        const objectCount = 4 + Math.floor(Math.random() * 3)
        
        for (let i = 0; i < objectCount; i++) {
            const angle = (i / objectCount) * Math.PI * 2
            const radius = island.size * 0.3 + Math.random() * island.size * 0.4
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = island.size * 0.4 + Math.random() * 3

            const objectType = objectTypes[Math.floor(Math.random() * objectTypes.length)]
            const objectColor = objectColors[Math.floor(Math.random() * objectColors.length)]
            
            let geometry
            const scale = 0.8 + Math.random() * 1.5

            switch (objectType) {
                case 'cube':
                    geometry = new THREE.BoxGeometry(scale, scale, scale)
                    break
                case 'cylinder':
                    geometry = new THREE.CylinderGeometry(scale * 0.5, scale * 0.5, scale * 2, 8)
                    break
                case 'cone':
                    geometry = new THREE.ConeGeometry(scale * 0.5, scale * 2, 8)
                    break
                case 'sphere':
                    geometry = new THREE.SphereGeometry(scale * 0.7, 16, 16)
                    break
                case 'torus':
                    geometry = new THREE.TorusGeometry(scale * 0.5, scale * 0.2, 8, 16)
                    break
            }

            const material = new THREE.MeshStandardMaterial({
                color: objectColor,
                roughness: 0.3,
                metalness: 0.2,
                emissive: objectColor,
                emissiveIntensity: 0.2
            })

            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(x, y, z)
            mesh.rotation.x = Math.random() * Math.PI
            mesh.rotation.y = Math.random() * Math.PI
            mesh.rotation.z = Math.random() * Math.PI
            mesh.castShadow = true
            mesh.receiveShadow = true
            
            islandGroup.add(mesh)

            // Add rotation animation
            gsap.to(mesh.rotation, {
                x: mesh.rotation.x + Math.PI * 2,
                y: mesh.rotation.y + Math.PI * 2,
                duration: 8 + Math.random() * 5,
                repeat: -1,
                ease: "none"
            })

            // Add floating animation
            gsap.to(mesh.position, {
                y: y + 1,
                duration: 3 + Math.random() * 2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            })
        }
    }

    setLearningResources() {
        // Create a central learning resources area
        const resourceArea = new THREE.Group()
        
        // Create a platform for the learning resources
        const platformGeometry = new THREE.CylinderGeometry(12, 15, 0.5, 8)
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: '#ffa500',
            metalness: 0.3,
            roughness: 0.4,
            emissive: '#ff7f00',
            emissiveIntensity: 0.2
        })
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial)
        platform.position.set(0, 0.25, -60)
        platform.receiveShadow = true
        resourceArea.add(platform)
        
        // Add glow effect to platform
        const glowGeometry = new THREE.CylinderGeometry(12.2, 15.2, 0.4, 8)
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: '#ffd700',
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        })
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        glow.position.set(0, 0.25, 0)
        platform.add(glow)
        
        // Add animation to glow
        gsap.to(glowMaterial, {
            opacity: 0.1,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })
        
        // Create a central hologram-like display
        const hologramStand = this.createHologramStand(0, 0.5, 0)
        platform.add(hologramStand)
        
        // Add resource categories as floating objects around the platform
        this.createResourceCategories(platform)
        
        // Add title above the platform
        this.createFloatingText("LEARNING RESOURCES", 0, 6, 0, "#ffffff", 1.2, platform)
        
        // Add subtitle
        this.createFloatingText("INTERACT TO EXPLORE", 0, 4.5, 0, "#ffd700", 0.6, platform)
        
        // Add the resource area to the scene
        resourceArea.position.z = -60
        this.scene.add(resourceArea)
        
        // Store reference for interaction
        this.resourceArea = resourceArea
    }
    
    createHologramStand(x, y, z) {
        const standGroup = new THREE.Group()
        standGroup.position.set(x, y, z)
        
        // Base of the stand
        const baseGeometry = new THREE.CylinderGeometry(1.5, 2, 1, 16)
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: '#3a3a3a',
            metalness: 0.8,
            roughness: 0.2
        })
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial)
        base.position.y = 0
        base.castShadow = true
        base.receiveShadow = true
        standGroup.add(base)
        
        // Pillar of the stand
        const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 16)
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: '#5a5a5a',
            metalness: 0.6,
            roughness: 0.3
        })
        
        const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
        pillar.position.y = 2
        pillar.castShadow = true
        standGroup.add(pillar)
        
        // Hologram emitter
        const emitterGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 16)
        const emitterMaterial = new THREE.MeshStandardMaterial({
            color: '#7a7a7a',
            metalness: 0.9,
            roughness: 0.1,
            emissive: '#00aaff',
            emissiveIntensity: 0.5
        })
        
        const emitter = new THREE.Mesh(emitterGeometry, emitterMaterial)
        emitter.position.y = 3.6
        standGroup.add(emitter)
        
        // Hologram projection (3D model of Earth/globe)
        const globeGeometry = new THREE.SphereGeometry(2, 32, 32)
        const globeMaterial = new THREE.MeshStandardMaterial({
            color: '#4287f5',
            transparent: true,
            opacity: 0.8,
            emissive: '#4287f5',
            emissiveIntensity: 0.5,
            wireframe: true
        })
        
        const globe = new THREE.Mesh(globeGeometry, globeMaterial)
        globe.position.y = 7
        standGroup.add(globe)
        
        // Add a wireframe sphere overlay
        const wireGeometry = new THREE.SphereGeometry(2.1, 16, 12)
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: '#00aaff',
            transparent: true,
            opacity: 0.3,
            wireframe: true
        })
        
        const wireframe = new THREE.Mesh(wireGeometry, wireMaterial)
        wireframe.position.y = 7
        standGroup.add(wireframe)
        
        // Add continents/details as noise on the sphere
        const detailGeometry = new THREE.SphereGeometry(2.05, 32, 32)
        const detailMaterial = new THREE.MeshBasicMaterial({
            color: '#ffa500',
            transparent: true,
            opacity: 0.5,
            alphaMap: this.createNoiseTexture()
        })
        
        const details = new THREE.Mesh(detailGeometry, detailMaterial)
        details.position.y = 7
        standGroup.add(details)
        
        // Add rotation animation
        gsap.to(globe.rotation, {
            y: Math.PI * 2,
            duration: 20,
            repeat: -1,
            ease: "none"
        })
        
        gsap.to(wireframe.rotation, {
            y: -Math.PI * 2,
            duration: 30,
            repeat: -1,
            ease: "none"
        })
        
        // Floating effect for the globe
        gsap.to(globe.position, {
            y: 7.3,
            duration: 4,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })
        
        gsap.to(wireframe.position, {
            y: 7.2,
            duration: 3.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })
        
        return standGroup
    }
    
    createNoiseTexture() {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const context = canvas.getContext('2d')
        
        // Fill with transparent black
        context.fillStyle = 'rgba(0,0,0,0)'
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add random noise spots
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * canvas.width
            const y = Math.random() * canvas.height
            const radius = 5 + Math.random() * 20
            
            context.beginPath()
            context.arc(x, y, radius, 0, Math.PI * 2)
            const alpha = 0.3 + Math.random() * 0.7
            context.fillStyle = `rgba(255, 255, 255, ${alpha})`
            context.fill()
        }
        
        const texture = new THREE.CanvasTexture(canvas)
        return texture
    }
    
    createResourceCategories(platform) {
        // Define resource categories
        const categories = [
            {
                title: "3D DESIGN GUIDES",
                description: "Comprehensive guides on environment design",
                resources: [
                    { name: "The Complete Guide to 3D Environment Design", author: "3D-Ace Studio" },
                    { name: "3D Environment Design", author: "Polydin Studio" },
                    { name: "Realistic 3D Environments: Tips and Tricks", author: "3DFoin" },
                    { name: "Guide to 3D Environments", author: "Animost" }
                ],
                color: "#ff7f00"
            },
            {
                title: "SOFTWARE & TOOLS",
                description: "Essential 3D software and libraries",
                resources: [
                    { name: "Three.js", author: "Ricardo Cabello" },
                    { name: "Blender", author: "Blender Foundation" },
                    { name: "Autodesk Maya", author: "Autodesk" },
                    { name: "3ds Max", author: "Autodesk" }
                ],
                color: "#00aaff"
            },
            {
                title: "DESIGN PRINCIPLES",
                description: "Core concepts of 3D environment creation",
                resources: [
                    { name: "Lighting Techniques", author: "Various" },
                    { name: "Texture Creation", author: "Various" },
                    { name: "Camera Movement", author: "Various" },
                    { name: "Particle Effects", author: "Various" }
                ],
                color: "#33cc33"
            },
            {
                title: "LEARNING ROADMAP",
                description: "Structured path to mastering 3D environments",
                resources: [
                    { name: "Beginner: 3D Basics", author: "Custom Path" },
                    { name: "Intermediate: Advanced Techniques", author: "Custom Path" },
                    { name: "Advanced: Optimization", author: "Custom Path" },
                    { name: "Expert: Real-time Environments", author: "Custom Path" }
                ],
                color: "#cc33cc"
            }
        ]
        
        // Create floating displays for each category in a circle around the center
        const radius = 8
        categories.forEach((category, index) => {
            const angle = (index / categories.length) * Math.PI * 2
            const x = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            
            // Create a floating display for this category
            const display = this.createResourceDisplay(category, x, 0, z, platform)
            
            // Add floating animation
            gsap.to(display.position, {
                y: 1 + 0.5 * Math.sin(index),
                duration: 3 + index * 0.5,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            })
        })
    }
    
    createResourceDisplay(category, x, y, z, parent) {
        const displayGroup = new THREE.Group()
        displayGroup.position.set(x, y + 2, z)
        
        // Look at center
        displayGroup.lookAt(new THREE.Vector3(0, y + 2, 0))
        
        // Create backing panel
        const panelGeometry = new THREE.BoxGeometry(4, 5, 0.1)
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: '#2a2a2a',
            transparent: true,
            opacity: 0.8,
            metalness: 0.2,
            roughness: 0.8
        })
        
        const panel = new THREE.Mesh(panelGeometry, panelMaterial)
        displayGroup.add(panel)
        
        // Add colored border
        const borderGeometry = new THREE.BoxGeometry(4.2, 5.2, 0.05)
        const borderMaterial = new THREE.MeshBasicMaterial({
            color: category.color,
            transparent: true,
            opacity: 0.8
        })
        
        const border = new THREE.Mesh(borderGeometry, borderMaterial)
        border.position.z = -0.03
        displayGroup.add(border)
        
        // Add category title
        this.createPanelText(category.title, 0, 2, 0.06, "#ffffff", 0.3, displayGroup)
        
        // Add category description
        this.createPanelText(category.description, 0, 1.3, 0.06, "#cccccc", 0.2, displayGroup)
        
        // Add resources
        category.resources.forEach((resource, index) => {
            const y = 0.5 - index * 0.6
            this.createPanelText(resource.name, 0, y, 0.06, "#ffffff", 0.15, displayGroup)
            this.createPanelText(`by ${resource.author}`, 0, y - 0.25, 0.06, "#aaaaaa", 0.12, displayGroup)
        })
        
        // Add resource type to panel for interaction
        panel.userData = {
            resourceType: this.getResourceType(category.title)
        }
        
        // Add to interactive objects array
        this.interactiveObjects.push(panel)
        
        // Add interaction indicator
        const indicatorGeometry = new THREE.SphereGeometry(0.2, 16, 16)
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: category.color,
            transparent: true,
            opacity: 0.8
        })
        
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial)
        indicator.position.set(0, -2.2, 0.2)
        displayGroup.add(indicator)
        
        // Add pulse animation to indicator
        gsap.to(indicator.scale, {
            x: 1.5,
            y: 1.5,
            z: 1.5,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })
        
        parent.add(displayGroup)
        return displayGroup
    }
    
    getResourceType(title) {
        const titleLower = title.toLowerCase()
        if (titleLower.includes('3d design')) return 'threejs'
        if (titleLower.includes('software')) return 'blender'
        if (titleLower.includes('design principles')) return 'maya'
        if (titleLower.includes('roadmap')) return 'game'
        return 'threejs' // Default
    }

    setupInteractions() {
        // Setup interaction raycaster
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        
        // Array to store interactive objects
        this.interactiveObjects = []
        this.currentIntersect = null
        
        // Get UI reference
        this.ui = this.experience.ui
        
        // Setup event listeners
        window.addEventListener('pointermove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
        })
        
        window.addEventListener('click', () => {
            if (this.currentIntersect) {
                const userData = this.currentIntersect.object.userData
                if (userData.resourceType) {
                    // Call UI method to open modal
                    this.ui.openResourceModal(userData.resourceType)
                }
            }
        })
    }

    // Add this method to check for interactions
    checkInteractions(camera) {
        if (!this.raycaster || !this.interactiveObjects.length) return
        
        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, camera)
        
        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects)
        
        // Handle hover state
        if (intersects.length) {
            if (this.currentIntersect !== intersects[0].object) {
                this.currentIntersect = intersects[0].object
                document.body.style.cursor = 'pointer'
                
                // Show resource info in UI
                if (this.ui && this.currentIntersect.userData.resourceType) {
                    this.ui.showResourceNearby(this.currentIntersect.userData.resourceType)
                }
                
                // Scale up the hovered panel
                gsap.to(this.currentIntersect.scale, {
                    x: 1.1,
                    y: 1.1,
                    z: 1.1,
                    duration: 0.3,
                    ease: "back.out(1.2)"
                })
            }
        } else {
            if (this.currentIntersect) {
                // Reset cursor
                document.body.style.cursor = 'auto'
                
                // Hide resource info in UI
                if (this.ui) {
                    this.ui.hideResourceNearby()
                }
                
                // Scale down the panel
                gsap.to(this.currentIntersect.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.3,
                    ease: "back.out(1.2)"
                })
                
                this.currentIntersect = null
            }
        }
    }

    createPanelText(text, x, y, z, color, size, parent) {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = 1024
        canvas.height = 256
        
        context.fillStyle = color
        context.font = `${size * 100}px Arial`
        context.textAlign = 'center'
        context.fillText(text, 512, 128)
        
        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        })
        
        const geometry = new THREE.PlaneGeometry(3.5, size * 10)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, y, z)
        parent.add(mesh)
        
        return mesh
    }
    
    createFloatingText(text, x, y, z, color, size, parent) {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = 1024
        canvas.height = 256
        
        context.fillStyle = color
        context.font = `Bold ${size * 100}px Arial`
        context.textAlign = 'center'
        context.fillText(text, 512, 128)
        
        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        })
        
        const geometry = new THREE.PlaneGeometry(size * 20, size * 5)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, y, z)
        parent.add(mesh)
        
        // Add floating animation
        gsap.to(mesh.position, {
            y: y + 0.5,
            duration: 3,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        })
        
        return mesh
    }
}