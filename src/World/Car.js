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
        this.driftFactor = 0.95
        this.engineSound = null
        
        // Advanced game physics properties
        this.boostMode = false
        this.boostCooldown = 0
        this.boostDuration = 2
        this.boostMaxCooldown = 3
        this.boostAccelerationMultiplier = 2.0
        this.boostMaxSpeedMultiplier = 1.5
        this.lastPosition = new THREE.Vector3()
        this.actualSpeed = 0
        this.isDrifting = false
        
        this.setModel()
        this.setPhysics()
        this.setParticles()
        this.setupResetListener()
        this.setupBoostListener()
    }

    setModel() {
        // Bruno Simon style car with glowing effects
        this.group = new THREE.Group()
        this.scene.add(this.group)
        
        // Main car body with rounded edges
        const bodyGeometry = new THREE.BoxGeometry(2.5, 1, 4.5)
        // Round the edges
        const edges = new THREE.EdgesGeometry(bodyGeometry)
        
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: '#ff7f00',
            metalness: 0.7,
            roughness: 0.3,
            emissive: '#ff9500',
            emissiveIntensity: 0.2
        })
        
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial)
        this.body.position.y = 0.5
        this.body.castShadow = true
        this.body.receiveShadow = true
        this.group.add(this.body)

        // Add glowing outline
        const outlineMaterial = new THREE.LineBasicMaterial({ 
            color: '#ffd700',
            linewidth: 3
        })
        const outline = new THREE.LineSegments(edges, outlineMaterial)
        outline.position.copy(this.body.position)
        this.group.add(outline)

        // Futuristic windshield
        const windshieldGeometry = new THREE.BoxGeometry(2.2, 0.8, 1.5)
        const windshieldMaterial = new THREE.MeshStandardMaterial({ 
            color: '#ffb347',
            transparent: true,
            opacity: 0.4,
            emissive: '#ffd700',
            emissiveIntensity: 0.3
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
                color: '#2c1810',
                metalness: 0.9,
                roughness: 0.1,
                emissive: '#ff7f00',
                emissiveIntensity: 0.4
            })
            
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
            wheel.rotation.z = Math.PI / 2
            wheel.castShadow = true
            wheelGroup.add(wheel)

            // Glowing rim
            const rimGeometry = new THREE.RingGeometry(0.3, 0.5, 16)
            const rimMaterial = new THREE.MeshBasicMaterial({
                color: '#ffd700',
                transparent: true,
                opacity: 0.9,
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
        this.body.position.set(0, 3, 0)
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI)
        
        // Add to physics world
        this.world.instance.addBody(this.body)
        
        // Apply initial force to overcome static friction
        this.body.applyLocalImpulse(new CANNON.Vec3(0, 0, -5), new CANNON.Vec3(0, 0, 0))

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
        
        // Debug - if car falls below -10, reset it
        if (this.body.position.y < -10) {
            this.resetPosition()
        }

        // Update cooldowns
        if (this.boostCooldown > 0) {
            this.boostCooldown -= dt
        }

        // Calculate actual speed for effects
        const currentPosition = this.group.position.clone()
        this.actualSpeed = currentPosition.distanceTo(this.lastPosition) / dt
        this.lastPosition.copy(currentPosition)

        // Get input
        const accelerate = keys['KeyW'] || keys['ArrowUp']
        const reverse = keys['KeyS'] || keys['ArrowDown']
        const turnLeft = keys['KeyA'] || keys['ArrowLeft']
        const turnRight = keys['KeyD'] || keys['ArrowRight']
        const brake = keys['Space']
        const boost = this.boostMode

        // Calculate acceleration and max speed with boost modifiers
        const currentAcceleration = this.acceleration * (boost ? this.boostAccelerationMultiplier : 1)
        const currentMaxSpeed = this.maxSpeed * (boost ? this.boostMaxSpeedMultiplier : 1)

        // Calculate acceleration
        let targetSpeed = 0
        if (accelerate) targetSpeed = currentMaxSpeed
        if (reverse) targetSpeed = -currentMaxSpeed * 0.5  // Reverse is slower
        
        // Apply brake
        if (brake) {
            targetSpeed *= 0.3  // Reduce target speed when braking
            this.speed *= 0.95  // More aggressive deceleration
        }
        
        // Apply drift physics for turning
        let turnIntensity = 0
        if (turnLeft) turnIntensity = 1
        if (turnRight) turnIntensity = -1
        
        // Adjust speed
        if (targetSpeed > this.speed) {
            this.speed = Math.min(this.speed + currentAcceleration * dt, targetSpeed)
        } else if (targetSpeed < this.speed) {
            this.speed = Math.max(this.speed - this.deceleration * dt, targetSpeed)
        } else {
            // Natural friction
            this.speed *= 0.99
        }
        
        // Stop if very slow
        if (Math.abs(this.speed) < 0.1) this.speed = 0
        
        // Calculate drift effect (reduce it when braking)
        const driftFactor = brake ? 0.98 : this.driftFactor
        
        // Determine if car is drifting (for sound effects)
        this.isDrifting = Math.abs(turnIntensity) > 0.5 && Math.abs(this.speed) > this.maxSpeed * 0.4 && !brake
        
        // Apply drift to velocity
        if (this.speed !== 0) {
            // Get forward vector of the car
            const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(this.body.quaternion)
            
            // Current velocity
            const currentVelocity = new THREE.Vector3(this.body.velocity.x, 0, this.body.velocity.z)
            
            // Calculate new velocity with drift
            const newVelocity = forwardVector.multiplyScalar(this.speed)
            
            // Blend between current and new velocity (drifting)
            const blendedVelocity = currentVelocity.lerp(newVelocity, driftFactor)
            
            // Update body velocity
            this.body.velocity.x = blendedVelocity.x
            this.body.velocity.z = blendedVelocity.z
        }
        
        // Apply turning force (more effective at lower speeds)
        const turnEffectiveness = Math.min(1.0, 1.0 - (Math.abs(this.speed) / this.maxSpeed) * 0.5)
        if (this.speed !== 0 && turnIntensity !== 0) {
            const turnAmount = this.turnSpeed * turnIntensity * dt * turnEffectiveness
            this.body.quaternion.multiply(new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), turnAmount))
        }
        
        // Keep car upright but allow for some tilt during turns
        this.body.angularVelocity.x *= 0.9
        this.body.angularVelocity.z *= 0.9
        
        // Update visual effects
        if (this.isDrifting && Math.random() > 0.7) {
            this.createDriftParticles()
            
            // Play drift sound if we have an audio manager
            if (this.experience && this.experience.audioManager && Math.random() > 0.8) {
                this.experience.audioManager.playDriftSound()
            }
        }
        
        // Update boost particles
        if (this.boostMode) {
            this.createBoostTrail()
        }
        
        // Update visual mesh to match physics body
        this.group.position.copy(this.body.position)
        this.group.quaternion.copy(this.body.quaternion)
        
        // Add banking effect during turns
        if (turnLeft || turnRight) {
            const bankAngle = (turnLeft ? 1 : -1) * 0.1 * Math.abs(this.speed) / this.maxSpeed
            this.group.rotation.z = THREE.MathUtils.lerp(this.group.rotation.z, bankAngle, 0.1)
        } else {
            this.group.rotation.z = THREE.MathUtils.lerp(this.group.rotation.z, 0, 0.1)
        }
        
        // Update wheel rotation and steering
        const wheelRotation = (this.speed * dt) / 0.4 // radius of wheel
        
        if (this.wheels && this.wheels.length) {
            this.wheels.forEach((wheel, index) => {
                if (index < 2) { // Front wheels - add steering
                    const steerAngle = turnLeft ? 0.3 : turnRight ? -0.3 : 0
                    wheel.rotation.y = THREE.MathUtils.lerp(wheel.rotation.y, steerAngle, 0.2)
                }
                // Add rotation based on speed - make sure we're rotating on the correct axis
                wheel.children[0].rotateZ(wheelRotation)
            })
        }

        // Update effects
        this.updateParticles(dt)
        this.updateSpeedEffects()
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
        
        if (!ui || typeof ui.checkZoneProximity !== 'function') {
            return
        }
        
        // Let the UI handle zone checking with its own zone definitions
        ui.checkZoneProximity(carPos)
    }

    resetPosition() {
        // Use reset method for consistency
        this.reset()
    }
    
    reset() {
        // Reset car position and rotation
        this.group.position.set(0, 2, 0)
        this.group.rotation.set(0, Math.PI, 0) // Rotate to face camera
        
        // Reset physics body
        this.body.position.set(0, 2, 0)
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI)
        this.body.velocity.set(0, 0, 0)
        this.body.angularVelocity.set(0, 0, 0)
        
        // Reset speed
        this.speed = 0
        
        // Add reset effect
        gsap.from(this.group.scale, {
            duration: 0.5,
            x: 1.2,
            y: 1.2,
            z: 1.2,
            ease: "back.out(1.7)"
        })
        
        // Add particle burst effect
        this.createResetEffect()
    }

    createResetEffect() {
        const burstGeometry = new THREE.BufferGeometry()
        const burstPositions = new Float32Array(100 * 3)
        
        for (let i = 0; i < 100; i++) {
            burstPositions[i * 3] = this.group.position.x
            burstPositions[i * 3 + 1] = this.group.position.y
            burstPositions[i * 3 + 2] = this.group.position.z
        }
        
        burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3))
        
        const burstMaterial = new THREE.PointsMaterial({
            color: '#4ecdc4',
            size: 0.2,
            transparent: true,
            opacity: 1
        })
        
        const burstParticles = new THREE.Points(burstGeometry, burstMaterial)
        this.scene.add(burstParticles)
        
        // Animate burst
        gsap.to(burstMaterial, {
            duration: 1,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => {
                this.scene.remove(burstParticles)
            }
        })
        
        // Animate positions
        const positions = burstParticles.geometry.attributes.position.array
        for (let i = 0; i < 100; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 5,
                (Math.random() - 0.5) * 10
            )
            
            gsap.to({}, {
                duration: 1,
                onUpdate: function() {
                    positions[i * 3] += velocity.x * 0.016
                    positions[i * 3 + 1] += velocity.y * 0.016
                    positions[i * 3 + 2] += velocity.z * 0.016
                    burstParticles.geometry.attributes.position.needsUpdate = true
                }
            })
        }
    }

    setupResetListener() {
        window.addEventListener('resetCar', () => {
            this.reset()
        })
    }

    setupBoostListener() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.activateBoost()
            }
        })
    }
    
    activateBoost() {
        // Only activate if not already in boost mode and cooldown expired
        if (!this.boostMode && this.boostCooldown <= 0) {
            this.boostMode = true
            this.boostCooldown = this.boostMaxCooldown
            
            // Create visual boost effect
            this.createBoostEffect()
            
            // Play boost sound
            if (this.experience && this.experience.audioManager) {
                this.experience.audioManager.playBoostSound()
            }
            
            // Reset after boost duration
            setTimeout(() => {
                this.boostMode = false
            }, this.boostDuration * 1000)
        }
    }
    
    createBoostEffect() {
        if (!this.scene) return
        
        // Create a burst of particles around the car
        this.createParticleEffect({
            position: this.group.position.clone(),
            count: 50,
            color: '#ff7f00',
            size: 0.3,
            spread: 2.0,
            lifetime: 1.2,
            speedFactor: 3.0,
            colorVariation: true
        })
        
        // Create visual effect on the car
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: '#ff7f00',
            transparent: true,
            opacity: 0.6
        })
        
        // Clone car body and make it glow
        const carBody = this.group.children.find(child => child.name === 'carBody')
        if (carBody) {
            const glowBody = carBody.clone()
            glowBody.material = glowMaterial
            glowBody.scale.multiplyScalar(1.05)
            
            this.group.add(glowBody)
            
            // Animate and remove
            gsap.to(glowMaterial, {
                opacity: 0,
                duration: this.boostDuration,
                onComplete: () => {
                    this.group.remove(glowBody)
                    glowBody.geometry.dispose()
                    glowMaterial.dispose()
                }
            })
        }
    }

    createDriftParticles() {
        if (!this.scene) return
        
        // Get wheel positions from the physics body
        const wheelPositions = [
            { x: -0.8, y: 0.3, z: -1.5 },  // Back left
            { x: 0.8, y: 0.3, z: -1.5 }    // Back right
        ]
        
        // Create particles at each wheel
        wheelPositions.forEach(pos => {
            // Convert local position to world position
            const worldPos = new THREE.Vector3(pos.x, pos.y, pos.z)
            worldPos.applyQuaternion(this.group.quaternion)
            worldPos.add(this.group.position)
            
            // Create particles
            this.createParticleEffect({
                position: worldPos,
                count: 10,
                color: '#ffffff',
                size: 0.1,
                spread: 0.2,
                lifetime: 0.8,
                speedFactor: 0.5
            })
        })
    }
    
    createBoostTrail() {
        if (!this.scene) return
        
        // Create particles behind the car
        const trailPos = new THREE.Vector3(0, 0.5, 1.8)  // Slightly behind the car
        trailPos.applyQuaternion(this.group.quaternion)
        trailPos.add(this.group.position)
        
        // Create fire-like effect
        this.createParticleEffect({
            position: trailPos,
            count: 8,
            color: '#ff7f00',
            size: 0.2,
            spread: 0.5,
            lifetime: 1.0,
            speedFactor: 1.5,
            colorVariation: true
        })
    }
    
    createParticleEffect(options) {
        const {
            position,
            count = 10,
            color = '#ffffff',
            size = 0.1,
            spread = 0.5,
            lifetime = 1.0,
            speedFactor = 1.0,
            colorVariation = false
        } = options
        
        // Create particle group
        const particles = []
        
        for (let i = 0; i < count; i++) {
            // Create particle geometry
            const geometry = new THREE.SphereGeometry(size * (0.8 + Math.random() * 0.4), 4, 4)
            
            // Create material with random color variation if enabled
            let particleColor = color
            if (colorVariation) {
                const hue = (parseInt(color.substr(1), 16) & 0xff0000) >> 16
                const sat = (parseInt(color.substr(1), 16) & 0x00ff00) >> 8
                const val = (parseInt(color.substr(1), 16) & 0x0000ff)
                
                // Add some variation
                const newHue = Math.max(0, Math.min(255, hue + (Math.random() * 40 - 20)))
                const newSat = Math.max(0, Math.min(255, sat + (Math.random() * 40 - 20)))
                const newVal = Math.max(0, Math.min(255, val + (Math.random() * 40 - 20)))
                
                particleColor = '#' + ((1 << 24) + (newHue << 16) + (newSat << 8) + newVal).toString(16).slice(1)
            }
            
            const material = new THREE.MeshBasicMaterial({
                color: particleColor,
                transparent: true,
                opacity: 0.8
            })
            
            // Create mesh and position it
            const particle = new THREE.Mesh(geometry, material)
            particle.position.copy(position)
            
            // Add some random offset
            particle.position.x += (Math.random() - 0.5) * spread
            particle.position.y += (Math.random() - 0.5) * spread
            particle.position.z += (Math.random() - 0.5) * spread
            
            // Random rotation
            particle.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            )
            
            // Calculate velocity based on car's movement and random direction
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * speedFactor,
                Math.random() * speedFactor,
                (Math.random() - 0.5) * speedFactor
            )
            
            // Add to scene
            this.scene.add(particle)
            particles.push({ mesh: particle, velocity, lifetime })
            
            // Animate and remove
            gsap.to(material, {
                opacity: 0,
                duration: lifetime * 0.8,
                delay: lifetime * 0.2,
                ease: "power1.out"
            })
            
            gsap.to(particle.scale, {
                x: 0.1,
                y: 0.1,
                z: 0.1,
                duration: lifetime,
                ease: "power2.out"
            })
        }
        
        // Update particles
        const updateParticles = () => {
            particles.forEach((p, index) => {
                p.mesh.position.add(p.velocity)
                p.lifetime -= 1/60
                
                // Remove if lifetime is over
                if (p.lifetime <= 0) {
                    this.scene.remove(p.mesh)
                    p.mesh.geometry.dispose()
                    p.mesh.material.dispose()
                    particles.splice(index, 1)
                }
            })
            
            if (particles.length > 0) {
                requestAnimationFrame(updateParticles)
            }
        }
        
        requestAnimationFrame(updateParticles)
    }
    
    updateSpeedEffects() {
        // Update car glow based on speed
        const normalizedSpeed = Math.abs(this.speed) / this.maxSpeed
        const bodyMaterial = this.group.children.find(child => child.name === 'carBody')?.material
        
        if (bodyMaterial) {
            // Adjust emissive intensity based on speed
            bodyMaterial.emissiveIntensity = 0.2 + normalizedSpeed * 0.8
        }
        
        // Update headlight intensity
        const headlights = this.group.children.filter(child => child.name === 'headlight')
        headlights.forEach(light => {
            if (light.material) {
                light.material.emissiveIntensity = 0.8 + normalizedSpeed * 0.2
            }
        })
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
