import { gsap } from 'gsap'

export class UI {
    constructor() {
        this.setupElements()
        this.setupEventListeners()
        this.setupModals()
        this.currentZone = null
        this.setupResourceInteraction()
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
            contact: document.getElementById('contact-modal'),
            resource: document.getElementById('resource-modal')
        }

        // Setup close buttons
        Object.values(this.modals).forEach(modal => {
            const closeBtn = modal.querySelector('.close-btn')
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

    setupResourceInteraction() {
        // Create interaction indicator element
        this.interactionIndicator = document.createElement('div')
        this.interactionIndicator.className = 'interaction-indicator'
        this.interactionIndicator.innerHTML = `<span class="key">E</span> View Resource`
        document.body.appendChild(this.interactionIndicator)

        // Keyboard interaction
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                if (this.activeResource) {
                    this.openResourceModal(this.activeResource)
                }
            }
        })

        // Setup initial resource data
        this.setupResourceData()
    }

    setupResourceData() {
        this.resourcesData = {
            // Three.js resources
            'threejs': {
                title: 'Three.js Learning Resources',
                description: 'Three.js is a JavaScript library used to create and display animated 3D computer graphics in a web browser using WebGL.',
                resources: [
                    { name: 'Three.js Documentation', author: 'Three.js', url: 'https://threejs.org/docs/' },
                    { name: 'Three.js Fundamentals', author: 'gfxfundamentals.org', url: 'https://threejs.org/manual/' },
                    { name: 'Discover Three.js', author: 'Lewy Blue', url: 'https://discoverthreejs.com/' },
                    { name: 'Three.js Journey', author: 'Bruno Simon', url: 'https://threejs-journey.com/' }
                ]
            },
            // Blender resources
            'blender': {
                title: 'Blender Learning Resources',
                description: 'Blender is a free and open-source 3D computer graphics software toolset used for creating animated films, visual effects, 3D models, and more.',
                resources: [
                    { name: 'Blender Documentation', author: 'Blender Foundation', url: 'https://docs.blender.org/' },
                    { name: 'Blender Guru Tutorials', author: 'Andrew Price', url: 'https://www.blenderguru.com/' },
                    { name: 'Blender Fundamentals', author: 'Blender Foundation', url: 'https://www.youtube.com/playlist?list=PLa1F2ddGya_-UvuAqHAksYnB0qL9yWDO6' }
                ]
            },
            // Maya/3ds Max resources
            'maya': {
                title: '3D Modeling Software Resources',
                description: 'Professional 3D modeling software like Maya and 3ds Max are industry standard tools for creating high-quality 3D assets.',
                resources: [
                    { name: 'Autodesk Maya Learning', author: 'Autodesk', url: 'https://area.autodesk.com/tutorials/maya/' },
                    { name: '3ds Max Learning Center', author: 'Autodesk', url: 'https://area.autodesk.com/tutorials/3ds-max/' },
                    { name: 'Maya for Beginners', author: 'Flipped Normals', url: 'https://flippednormals.com/downloads/maya-for-beginners/' }
                ]
            },
            // Game Design resources
            'game': {
                title: 'Game Design Resources',
                description: 'Learn about game design principles, mechanics, and how to create engaging interactive experiences.',
                resources: [
                    { name: 'Game Programming Patterns', author: 'Robert Nystrom', url: 'https://gameprogrammingpatterns.com/' },
                    { name: 'The Art of Game Design', author: 'Jesse Schell', url: 'http://artofgamedesign.com/' },
                    { name: 'Game Developer Resources', author: 'Gamasutra', url: 'https://www.gamedeveloper.com/' }
                ]
            }
        }
    }

    showResourceNearby(resourceType) {
        this.activeResource = resourceType
        this.interactionIndicator.classList.add('active')
    }

    hideResourceNearby() {
        this.activeResource = null
        this.interactionIndicator.classList.remove('active')
    }

    openResourceModal(resourceType) {
        const resourceData = this.resourcesData[resourceType]
        if (!resourceData) return
        
        const modal = this.modals.resource
        const modalTitle = modal.querySelector('.modal-title')
        const modalDescription = modal.querySelector('.description')
        const resourceList = modal.querySelector('.resource-list ul')
        
        // Set title and description
        modalTitle.textContent = resourceData.title
        modalDescription.textContent = resourceData.description
        
        // Clear and populate resource list
        resourceList.innerHTML = ''
        resourceData.resources.forEach(resource => {
            const li = document.createElement('li')
            li.innerHTML = `
                <span class="resource-name">${resource.name}</span>
                <span class="resource-author">by ${resource.author}</span>
            `
            li.addEventListener('click', () => {
                window.open(resource.url, '_blank')
            })
            resourceList.appendChild(li)
        })
        
        // Open the modal
        this.openModal(modal)
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
