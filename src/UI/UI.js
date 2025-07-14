import { gsap } from 'gsap'

export class UI {
    constructor() {
        this.setupElements()
        this.setupEventListeners()
        this.setupModals()
        this.currentZone = null
    }

    setupElements() {
        this.elements = {
            zoneInfo: document.getElementById('zone-info'),
            zoneTitle: document.getElementById('zone-title'),
            zoneDescription: document.getElementById('zone-description'),
            zoneAction: document.getElementById('zone-action'),
            speedText: document.querySelector('.speed-text'),
            speedNeedle: document.querySelector('.speed-needle'),
            minimapCanvas: document.getElementById('minimap-canvas'),
            minimapCar: document.querySelector('.minimap-car')
        }

        this.setupMinimap()
    }

    setupMinimap() {
        const canvas = this.elements.minimapCanvas
        this.minimapCtx = canvas.getContext('2d')
        canvas.width = 200
        canvas.height = 200
        
        this.minimapScale = 2 // 1 unit in world = 2 pixels on minimap
        this.minimapCenter = { x: 100, y: 100 }
    }

    setupEventListeners() {
        // Zone action button
        this.elements.zoneAction.addEventListener('click', () => {
            this.handleZoneAction()
        })

        // Custom cursor
        this.setupCustomCursor()
    }

    setupCustomCursor() {
        const cursor = document.createElement('div')
        cursor.className = 'custom-cursor'
        document.body.appendChild(cursor)

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px'
            cursor.style.top = e.clientY + 'px'
        })

        // Add hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('button, .project-card, .zone-info')) {
                cursor.classList.add('hover')
            } else {
                cursor.classList.remove('hover')
            }
        })
    }

    setupModals() {
        this.modals = {
            project: document.getElementById('project-modal'),
            about: document.getElementById('about-modal'),
            contact: document.getElementById('contact-modal')
        }

        // Setup close buttons
        Object.values(this.modals).forEach(modal => {
            const closeBtn = modal.querySelector('.close')
            closeBtn.addEventListener('click', () => {
                this.closeModal(modal)
            })

            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal)
                }
            })
        })

        // Setup contact form
        this.setupContactForm()
        
        // Populate projects
        this.populateProjects()
    }

    setupContactForm() {
        const form = document.getElementById('contact-form')
        form.addEventListener('submit', (e) => {
            e.preventDefault()
            
            const formData = new FormData(form)
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            }

            this.submitContactForm(data)
        })
    }

    populateProjects() {
        const projectGallery = document.getElementById('project-gallery')
        
        const projects = [
            {
                title: '3D WebGL Game Engine',
                description: 'A custom WebGL game engine built with Three.js featuring physics simulation, particle systems, and advanced lighting.',
                technologies: ['Three.js', 'WebGL', 'Cannon.js', 'GLSL'],
                demo: '#',
                github: '#'
            },
            {
                title: 'Interactive Data Visualization',
                description: 'Real-time data visualization platform with 3D charts and interactive elements for complex datasets.',
                technologies: ['D3.js', 'Three.js', 'WebGL', 'Node.js'],
                demo: '#',
                github: '#'
            },
            {
                title: 'AR Portfolio Experience',
                description: 'Augmented reality portfolio experience using WebXR API for immersive project showcase.',
                technologies: ['WebXR', 'Three.js', 'AR.js', 'JavaScript'],
                demo: '#',
                github: '#'
            },
            {
                title: 'Procedural Terrain Generator',
                description: 'Real-time procedural terrain generation with noise functions and dynamic LOD system.',
                technologies: ['Three.js', 'Noise.js', 'WebGL', 'GLSL'],
                demo: '#',
                github: '#'
            },
            {
                title: 'VR Music Visualizer',
                description: 'Virtual reality music visualization experience with reactive 3D environments.',
                technologies: ['A-Frame', 'Web Audio API', 'WebVR', 'Three.js'],
                demo: '#',
                github: '#'
            },
            {
                title: 'Physics Simulation Playground',
                description: 'Interactive physics simulation with soft body dynamics and fluid simulation.',
                technologies: ['Cannon.js', 'Three.js', 'WebGL', 'Compute Shaders'],
                demo: '#',
                github: '#'
            }
        ]

        projects.forEach(project => {
            const projectCard = document.createElement('div')
            projectCard.className = 'project-card'
            
            projectCard.innerHTML = `
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="tech-tags">
                    ${project.technologies.map(tech => `<span class="skill">${tech}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${project.demo}" class="project-link" target="_blank">Live Demo</a>
                    <a href="${project.github}" class="project-link" target="_blank">GitHub</a>
                </div>
            `
            
            projectGallery.appendChild(projectCard)

            // Add hover animation
            projectCard.addEventListener('mouseenter', () => {
                gsap.to(projectCard, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "back.out(1.2)"
                })
            })

            projectCard.addEventListener('mouseleave', () => {
                gsap.to(projectCard, {
                    scale: 1,
                    duration: 0.3,
                    ease: "back.out(1.2)"
                })
            })
        })
    }

    showZoneInfo(title, description, action) {
        if (this.currentZone === title) return
        
        this.currentZone = title
        this.elements.zoneTitle.textContent = title
        this.elements.zoneDescription.textContent = description
        this.elements.zoneAction.textContent = action
        this.elements.zoneAction.style.display = 'block'
        
        this.elements.zoneInfo.classList.add('active')
        
        // Animate in
        gsap.fromTo(this.elements.zoneInfo, 
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
        )
    }

    hideZoneInfo() {
        if (!this.currentZone) return
        
        this.currentZone = null
        this.elements.zoneInfo.classList.remove('active')
        
        // Animate out
        gsap.to(this.elements.zoneInfo, {
            y: 50,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in"
        })
    }

    handleZoneAction() {
        switch (this.currentZone) {
            case 'Projects':
                this.openModal(this.modals.project)
                break
            case 'About':
                this.openModal(this.modals.about)
                break
            case 'Contact':
                this.openModal(this.modals.contact)
                break
        }
    }

    openModal(modal) {
        modal.classList.add('active')
        modal.style.display = 'flex'
        
        // Animate modal content
        const content = modal.querySelector('.modal-content')
        gsap.fromTo(content,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.2)" }
        )
        
        // Blur background
        document.querySelector('#webgl-canvas').style.filter = 'blur(5px)'
    }

    closeModal(modal) {
        const content = modal.querySelector('.modal-content')
        
        gsap.to(content, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                modal.classList.remove('active')
                modal.style.display = 'none'
            }
        })
        
        // Remove blur
        document.querySelector('#webgl-canvas').style.filter = 'none'
    }

    update(car) {
        if (!car) return
        
        this.updateSpeedometer(car.getSpeed())
        this.updateMinimap(car.getPosition(), car.getRotation())
    }

    updateSpeedometer(speed) {
        const kmh = Math.round(speed * 3.6) // Convert m/s to km/h
        this.elements.speedText.textContent = `${kmh} km/h`
        
        // Update needle rotation (0-180 degrees for 0-100 km/h)
        const needleRotation = Math.min(speed * 1.8, 180)
        this.elements.speedNeedle.style.transform = `translateX(-50%) rotate(${needleRotation}deg)`
    }

    updateMinimap(carPosition, carRotation) {
        const ctx = this.minimapCtx
        
        // Clear canvas
        ctx.clearRect(0, 0, 200, 200)
        
        // Draw background
        ctx.fillStyle = '#2f3542'
        ctx.fillRect(0, 0, 200, 200)
        
        // Draw roads
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 8
        ctx.beginPath()
        // Main road (vertical)
        ctx.moveTo(100, 0)
        ctx.lineTo(100, 200)
        // Cross road (horizontal)
        ctx.moveTo(0, 100)
        ctx.lineTo(200, 100)
        ctx.stroke()
        
        // Draw zones
        const zones = [
            { x: -20, z: -20, color: '#FF4757' }, // Projects
            { x: 20, z: -20, color: '#3742FA' },  // About
            { x: 0, z: -40, color: '#2ED573' }    // Contact
        ]
        
        zones.forEach(zone => {
            const x = this.minimapCenter.x + zone.x * this.minimapScale
            const y = this.minimapCenter.y + zone.z * this.minimapScale
            
            ctx.fillStyle = zone.color
            ctx.beginPath()
            ctx.arc(x, y, 6, 0, Math.PI * 2)
            ctx.fill()
        })
        
        // Update car position on minimap
        const carX = this.minimapCenter.x + carPosition.x * this.minimapScale
        const carY = this.minimapCenter.y + carPosition.z * this.minimapScale
        
        this.elements.minimapCar.style.left = `${carX - 3}px`
        this.elements.minimapCar.style.top = `${carY - 3}px`
        this.elements.minimapCar.style.transform = `translate(-50%, -50%) rotate(${carRotation.y}rad)`
    }

    showWelcomeMessage() {
        this.showZoneInfo(
            'Welcome to my 3D Portfolio!',
            'Use WASD or arrow keys to drive around and explore different areas',
            'Start Exploring'
        )
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideZoneInfo()
        }, 5000)
    }

    submitContactForm(data) {
        // Simulate form submission
        const submitBtn = document.querySelector('.submit-btn')
        const originalText = submitBtn.textContent
        
        submitBtn.textContent = 'Sending...'
        submitBtn.disabled = true
        
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent!'
            submitBtn.style.background = '#2ED573'
            
            setTimeout(() => {
                submitBtn.textContent = originalText
                submitBtn.disabled = false
                submitBtn.style.background = ''
                
                // Close modal
                this.closeModal(this.modals.contact)
                
                // Reset form
                document.getElementById('contact-form').reset()
            }, 2000)
        }, 1500)
        
        console.log('Contact form submitted:', data)
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div')
        notification.className = `notification ${type}`
        notification.textContent = message
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#2ED573' : '#FF4757'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            transform: translateX(100%);
        `
        
        document.body.appendChild(notification)
        
        // Animate in
        gsap.to(notification, {
            x: 0,
            duration: 0.5,
            ease: "back.out(1.2)"
        })
        
        // Auto remove
        setTimeout(() => {
            gsap.to(notification, {
                x: '100%',
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    notification.remove()
                }
            })
        }, 3000)
    }
}
