import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { gsap } from 'gsap'

export class Car {
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
        this.speed = 0
        this.maxSpeed = 80
        this.acceleration = 30
        this.deceleration = 40
        this.turnSpeed = 3
        
        this.setModel()
        this.setPhysics()
        this.setParticles()
    }

    setModel() {
        // Bruno Simon style car with glowing effects
        this.group = new THREE.Group()
        
        // Main car body with rounded edges
        const bodyGeometry = new THREE.BoxGeometry(2.5, 1, 4.5)
        // Round the edges
        const edges = new THREE.EdgesGeometry(bodyGeometry)
        
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: '#ff6b9d',
            metalness: 0.8,
            roughness: 0.2,
            emissive: '#ff6b9d',
            emissiveIntensity: 0.1
        })
        
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial)
        this.body.position.y = 0.5
        this.body.castShadow = true
        this.body.receiveShadow = true
        this.group.add(this.body)

        // Add glowing outline
        const outlineMaterial = new THREE.LineBasicMaterial({ 
            color: '#4ecdc4',
            linewidth: 3
        })
        const outline = new THREE.LineSegments(edges, outlineMaterial)
        outline.position.copy(this.body.position)
        this.group.add(outline)

        // Futuristic windshield
        const windshieldGeometry = new THREE.BoxGeometry(2.2, 0.8, 1.5)
        const windshieldMaterial = new THREE.MeshStandardMaterial({ 
            color: '#4ecdc4',
            transparent: true,
            opacity: 0.3,
            emissive: '#4ecdc4',
            emissiveIntensity: 0.2
        })
        this.windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial)
        this.windshield.position.set(0, 1.2, 0.5)
        this.group.add(this.windshield)

        // Glowing wheels
        this.wheels = []
        const wheelPositions = [
            { x: -1.3, y: 0.4, z: 1.5 },  // Front left
            { x: 1.3, y: 0.4, z: 1.5 },   // Front right
            { x: -1.3, y: 0.4, z: -1.5 }, // Rear left
            { x: 1.3, y: 0.4, z: -1.5 }   // Rear right
        ]

        wheelPositions.forEach((pos, index) => {
            const wheelGroup = new THREE.Group()
            
            // Main wheel
            const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16)
            const wheelMaterial = new THREE.MeshStandardMaterial({ 
                color: '#1a1a2e',
                metalness: 0.9,
                roughness: 0.1,
                emissive: '#4ecdc4',
                emissiveIntensity: 0.3
            })
            
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
            wheel.rotation.z = Math.PI / 2
            wheel.castShadow = true
            wheelGroup.add(wheel)

            // Glowing rim
            const rimGeometry = new THREE.RingGeometry(0.3, 0.5, 16)
            const rimMaterial = new THREE.MeshBasicMaterial({
                color: '#4ecdc4',
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            })
            const rim = new THREE.Mesh(rimGeometry, rimMaterial)
            rim.rotation.y = Math.PI / 2
            wheelGroup.add(rim)

            wheelGroup.position.set(pos.x, pos.y, pos.z)
            this.wheels.push(wheelGroup)
            this.group.add(wheelGroup)
        })

        // Glowing headlights
        const headlightPositions = [
            { x: -0.8, y: 0.7, z: 2.1 },
            { x: 0.8, y: 0.7, z: 2.1 }
        ]

        headlightPositions.forEach(pos => {
            const lightGroup = new THREE.Group()
            
            // Light orb
            const lightGeometry = new THREE.SphereGeometry(0.2, 16, 16)
            const lightMaterial = new THREE.MeshBasicMaterial({
                color: '#ffffff',
                emissive: '#ffffff',
                emissiveIntensity: 1
            })
            const light = new THREE.Mesh(lightGeometry, lightMaterial)
            lightGroup.add(light)

            // Light cone effect
            const coneGeometry = new THREE.ConeGeometry(0.3, 0.5, 8, 1, true)
            const coneMaterial = new THREE.MeshBasicMaterial({
                color: '#ffffff',
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            })
            const cone = new THREE.Mesh(coneGeometry, coneMaterial)
            cone.position.z = 0.3
            cone.rotation.x = Math.PI / 2
            lightGroup.add(cone)

            lightGroup.position.set(pos.x, pos.y, pos.z)
            this.group.add(lightGroup)

            // Pulsing effect
            gsap.to(lightMaterial, {
                emissiveIntensity: 0.5,
                duration: 1,
                yoyo: true,
                repeat: -1,
                ease: "power2.inOut"
            })
        })

        // Add car to scene
        this.mesh = this.group
        this.scene.add(this.group)
        
        // Initial position
        this.group.position.set(0, 2, 0)

        // Add subtle hover effect
        gsap.to(this.group.position, {
            y: 2.2,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: "power2.inOut"
        })
    }

    setPhysics() {
        // Create physics body for the car
        const carShape = new CANNON.Box(new CANNON.Vec3(1, 0.4, 2))
        this.body = new CANNON.Body({ 
            mass: 150,
            material: this.world.carMaterial
        })
        this.body.addShape(carShape)
        
        // Set initial position
        this.body.position.set(0, 2, 0)
        
        // Add to physics world
        this.world.instance.addBody(this.body)

        // Create wheel bodies (for better physics simulation)
        this.wheelBodies = []
        this.wheelConstraints = []

        this.wheels.forEach((wheel, index) => {
            const wheelShape = new CANNON.Cylinder(0.4, 0.4, 0.3, 8)
            const wheelBody = new CANNON.Body({ 
                mass: 10,
                material: this.world.carMaterial
            })
            wheelBody.addShape(wheelShape)
            
            // Position relative to car
            const localPos = wheel.position.clone()
            wheelBody.position.copy(this.body.position)
            wheelBody.position.x += localPos.x
            wheelBody.position.y += localPos.y
            wheelBody.position.z += localPos.z
            
            this.wheelBodies.push(wheelBody)
            this.world.instance.addBody(wheelBody)

            // Create constraints to connect wheels to car body
            const constraint = new CANNON.PointToPointConstraint(
                this.body,
                new CANNON.Vec3(localPos.x, localPos.y, localPos.z),
                wheelBody,
                new CANNON.Vec3(0, 0, 0)
            )
            this.world.instance.addConstraint(constraint)
            this.wheelConstraints.push(constraint)
        })
    }

    setParticles() {
        // Dust particles for when car is moving
        this.dustParticles = new THREE.Group()
        this.scene.add(this.dustParticles)
        
        // Create particle system
        const particleCount = 50
        const particles = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)
        const velocities = []
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0
            positions[i * 3 + 1] = 0
            positions[i * 3 + 2] = 0
            velocities.push({ x: 0, y: 0, z: 0, life: 0 })
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        
        const particleMaterial = new THREE.PointsMaterial({
            color: '#8B4513',
            size: 0.1,
            transparent: true,
            opacity: 0.6
        })
        
        this.particleSystem = new THREE.Points(particles, particleMaterial)
        this.particleVelocities = velocities
        this.dustParticles.add(this.particleSystem)
    }

    update(keys, deltaTime) {
        const dt = deltaTime / 1000

        // Get input
        const accelerate = keys['KeyW'] || keys['ArrowUp']
        const reverse = keys['KeyS'] || keys['ArrowDown']
        const turnLeft = keys['KeyA'] || keys['ArrowLeft']
        const turnRight = keys['KeyD'] || keys['ArrowRight']
        const brake = keys['Space']

        // Calculate acceleration
        let targetSpeed = 0
        if (accelerate) {
            targetSpeed = this.maxSpeed
        } else if (reverse) {
            targetSpeed = -this.maxSpeed * 0.5
        }

        // Apply acceleration/deceleration
        if (targetSpeed > this.speed) {
            this.speed = Math.min(this.speed + this.acceleration * dt, targetSpeed)
        } else if (targetSpeed < this.speed) {
            this.speed = Math.max(this.speed - this.deceleration * dt, targetSpeed)
        } else {
            // Natural deceleration when no input
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.deceleration * 0.5 * dt)
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.deceleration * 0.5 * dt)
            }
        }

        // Apply brake
        if (brake) {
            this.speed *= 0.95
        }

        // Calculate movement
        const velocity = new THREE.Vector3(0, 0, -this.speed * dt)
        
        // Apply turning (only when moving)
        if (Math.abs(this.speed) > 0.1) {
            let turnAmount = 0
            if (turnLeft) turnAmount += this.turnSpeed * dt
            if (turnRight) turnAmount -= this.turnSpeed * dt
            
            // Scale turn amount by speed
            turnAmount *= Math.abs(this.speed) / this.maxSpeed
            
            this.body.angularVelocity.y = turnAmount * 3
        } else {
            this.body.angularVelocity.y *= 0.8
        }

        // Apply velocity to physics body
        velocity.applyQuaternion(this.body.quaternion)
        this.body.velocity.x = velocity.x * 20
        this.body.velocity.z = velocity.z * 20

        // Keep car upright
        this.body.angularVelocity.x *= 0.9
        this.body.angularVelocity.z *= 0.9

        // Update visual mesh to match physics body
        this.group.position.copy(this.body.position)
        this.group.quaternion.copy(this.body.quaternion)

        // Update wheel rotation
        const wheelRotation = (this.speed * dt) / 0.4 // radius of wheel
        this.wheels.forEach((wheel, index) => {
            if (index < 2) { // Front wheels - add steering
                const steerAngle = turnLeft ? 0.3 : turnRight ? -0.3 : 0
                wheel.rotation.y = steerAngle
            }
            wheel.rotateX(wheelRotation)
        })

        // Update particles
        this.updateParticles(dt)

        // Check for zone interactions
        this.checkZoneInteractions()
    }

    updateParticles(deltaTime) {
        if (Math.abs(this.speed) > 5) {
            const positions = this.particleSystem.geometry.attributes.position.array
            
            this.particleVelocities.forEach((velocity, i) => {
                if (velocity.life <= 0) {
                    // Spawn new particle
                    positions[i * 3] = this.group.position.x + (Math.random() - 0.5) * 2
                    positions[i * 3 + 1] = this.group.position.y - 0.5
                    positions[i * 3 + 2] = this.group.position.z - 2 + (Math.random() - 0.5) * 2
                    
                    velocity.x = (Math.random() - 0.5) * 2
                    velocity.y = Math.random() * 2
                    velocity.z = Math.random() * 2 + 2
                    velocity.life = 1
                } else {
                    // Update existing particle
                    positions[i * 3] += velocity.x * deltaTime
                    positions[i * 3 + 1] += velocity.y * deltaTime
                    positions[i * 3 + 2] += velocity.z * deltaTime
                    
                    velocity.life -= deltaTime * 2
                }
            })
            
            this.particleSystem.geometry.attributes.position.needsUpdate = true
        }
    }

    checkZoneInteractions() {
        const carPos = this.group.position
        const ui = this.experience.ui
        
        // Define zones
        const zones = [
            {
                name: 'Projects',
                position: new THREE.Vector3(-20, 0, -20),
                radius: 8,
                description: 'Explore my latest projects and creations',
                action: 'View Projects'
            },
            {
                name: 'About',
                position: new THREE.Vector3(20, 0, -20),
                radius: 8,
                description: 'Learn more about my skills and experience',
                action: 'About Me'
            },
            {
                name: 'Contact',
                position: new THREE.Vector3(0, 0, -40),
                radius: 8,
                description: 'Get in touch for collaborations and opportunities',
                action: 'Contact Me'
            }
        ]
        
        let inZone = null
        zones.forEach(zone => {
            const distance = carPos.distanceTo(zone.position)
            if (distance < zone.radius) {
                inZone = zone
            }
        })
        
        if (inZone) {
            ui.showZoneInfo(inZone.name, inZone.description, inZone.action)
        } else {
            ui.hideZoneInfo()
        }
    }

    getSpeed() {
        return Math.abs(this.speed)
    }

    getPosition() {
        return this.group.position
    }

    getRotation() {
        return this.group.rotation
    }
}
