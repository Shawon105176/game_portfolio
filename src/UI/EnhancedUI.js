import { gsap } from 'gsap'

export class UI {
    constructor() {
        this.setupElements()
        this.setupEventListeners()
        this.setupAnimations()
        this.currentZone = null
        this.fps = 60
        this.frameCount = 0
        this.lastTime = performance.now()
        
        // Bruno Simon style tip rotation
        this.tipIndex = 0
        this.setupTipRotation()
        this.musicPlaying = false
    }

    setupElements() {
        // Get all UI elements
        this.loadingScreen = document.getElementById('loading-screen')
        this.startBtn = document.getElementById('start-btn')
        this.speedIndicator = document.querySelector('.speed-indicator')
        this.speedNeedle = document.querySelector('.speed-needle')
        this.speedValue = document.getElementById('speed-value')
        this.zoneInfo = document.getElementById('zone-info')
        this.zoneTitle = document.getElementById('zone-title')
        this.zoneDescription = document.getElementById('zone-description')
        this.zoneAction = document.getElementById('zone-action')
        this.zoneIcon = document.getElementById('zone-icon')
        this.fpsCounter = document.getElementById('fps')
        this.musicToggle = document.getElementById('music-toggle')
        
        // Modal elements
        this.projectModal = document.getElementById('project-modal')
        this.aboutModal = document.getElementById('about-modal')
        this.contactModal = document.getElementById('contact-modal')
        this.modals = [this.projectModal, this.aboutModal, this.contactModal]
        
        // Minimap
        this.minimapCanvas = document.getElementById('minimap-canvas')
        this.minimapCar = document.querySelector('.minimap-car')
        this.setupMinimap()
    }

    setupEventListeners() {
        // Start button
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                this.hideLoadingScreen()
            })
        }

        // Music toggle
        if (this.musicToggle) {
            this.musicToggle.addEventListener('click', () => {
                this.toggleMusic()
            })
        }

        // Zone action button
        if (this.zoneAction) {
            this.zoneAction.addEventListener('click', () => {
                this.handleZoneAction()
            })
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'))
            })
        })

        // Click outside modal to close
        this.modals.forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modal)
                    }
                })
            }
        })

        // Contact form submission
        const contactForm = document.getElementById('contact-form')
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault()
                this.handleContactForm(e)
            })
        }

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Escape':
                    this.closeAllModals()
                    break
                case 'KeyP':
                    if (this.projectModal) this.openModal(this.projectModal)
                    break
                case 'KeyA':
                    if (this.aboutModal) this.openModal(this.aboutModal)
                    break
                case 'KeyC':
                    if (this.contactModal) this.openModal(this.contactModal)
                    break
                case 'KeyM':
                    this.toggleMusic()
                    break
                case 'KeyR':
                    // Reset car position - will be handled by car class
                    window.dispatchEvent(new CustomEvent('resetCar'))
                    break
            }
        })
    }

    setupAnimations() {
        // Animate loading screen elements on load
        if (document.querySelector('.logo-text')) {
            gsap.timeline()
                .from('.logo-text', {
                    duration: 1.5,
                    y: 50,
                    opacity: 0,
                    ease: "back.out(1.7)"
                })
                .from('.logo-subtitle', {
                    duration: 1,
                    y: 30,
                    opacity: 0,
                    ease: "power2.out"
                }, "-=1")
                .from('#start-btn', {
                    duration: 1,
                    y: 30,
                    opacity: 0,
                    scale: 0.8,
                    ease: "back.out(1.7)"
                }, "-=0.5")
                .from('.loading-tips .tip', {
                    duration: 0.8,
                    y: 20,
                    opacity: 0,
                    stagger: 0.2,
                    ease: "power2.out"
                }, "-=0.3")
        }

        // Animate UI elements when they first appear
        setTimeout(() => {
            if (document.querySelector('.controls-info')) {
                gsap.from('.controls-info', {
                    duration: 1,
                    x: -100,
                    opacity: 0,
                    ease: "power2.out"
                })
            }

            if (document.querySelector('.performance-monitor')) {
                gsap.from('.performance-monitor', {
                    duration: 1,
                    x: 100,
                    opacity: 0,
                    ease: "power2.out",
                    delay: 0.2
                })
            }

            if (document.querySelector('.minimap')) {
                gsap.from('.minimap', {
                    duration: 1,
                    y: 100,
                    opacity: 0,
                    ease: "power2.out",
                    delay: 0.4
                })
            }

            if (document.querySelector('.speed-indicator')) {
                gsap.from('.speed-indicator', {
                    duration: 1,
                    y: 100,
                    opacity: 0,
                    ease: "power2.out",
                    delay: 0.6
                })
            }
        }, 2000)
    }

    setupTipRotation() {
        const tips = document.querySelectorAll('.loading-tips .tip')
        if (tips.length === 0) return

        const rotateTips = () => {
            tips.forEach(tip => tip.classList.remove('active'))
            if (tips[this.tipIndex]) {
                tips[this.tipIndex].classList.add('active')
            }
            this.tipIndex = (this.tipIndex + 1) % tips.length
        }

        // Start tip rotation
        setInterval(rotateTips, 3000)
    }

    setupMinimap() {
        if (!this.minimapCanvas) return

        const ctx = this.minimapCanvas.getContext('2d')
        const width = this.minimapCanvas.width = 168
        const height = this.minimapCanvas.height = 120

        // Draw minimap background
        ctx.fillStyle = 'rgba(13, 13, 35, 0.8)'
        ctx.fillRect(0, 0, width, height)

        // Draw zone indicators
        const zones = [
            { x: 30, y: 24, color: '#4ecdc4', name: 'Projects' },
            { x: 134, y: 84, color: '#ff6b9d', name: 'About' },
            { x: 67, y: 96, color: '#45b7d1', name: 'Contact' },
            { x: 112, y: 48, color: '#9b59b6', name: 'Skills' }
        ]

        zones.forEach(zone => {
            ctx.beginPath()
            ctx.arc(zone.x, zone.y, 4, 0, Math.PI * 2)
            ctx.fillStyle = zone.color
            ctx.fill()
            ctx.shadowColor = zone.color
            ctx.shadowBlur = 8
        })
    }

    hideLoadingScreen() {
        if (!this.startBtn || !this.loadingScreen) return

        // Add exit animation to start button
        gsap.to('#start-btn', {
            duration: 0.6,
            scale: 0.8,
            opacity: 0,
            ease: "power2.in"
        })

        // Animate loading screen out
        gsap.to(this.loadingScreen, {
            duration: 1,
            opacity: 0,
            scale: 1.1,
            ease: "power2.inOut",
            delay: 0.3,
            onComplete: () => {
                this.loadingScreen.style.display = 'none'
                this.showWelcomeMessage()
            }
        })
    }

    showWelcomeMessage() {
        this.showZoneInfo({
            icon: '🚗',
            title: 'Welcome to My Portfolio',
            description: 'Drive around to explore different areas and discover my work. Use WASD to move and mouse to look around.',
            action: null
        })

        // Hide welcome message after 5 seconds
        setTimeout(() => {
            this.hideZoneInfo()
        }, 5000)
    }

    showZoneInfo(zoneData) {
        if (!this.zoneInfo) return
        if (this.currentZone === zoneData.title) return

        this.currentZone = zoneData.title
        
        if (this.zoneIcon) this.zoneIcon.textContent = zoneData.icon
        if (this.zoneTitle) this.zoneTitle.textContent = zoneData.title
        if (this.zoneDescription) this.zoneDescription.textContent = zoneData.description

        if (zoneData.action && this.zoneAction) {
            this.zoneAction.style.display = 'block'
            this.zoneAction.querySelector('.btn-text').textContent = zoneData.action
        } else if (this.zoneAction) {
            this.zoneAction.style.display = 'none'
        }

        // Animate zone info in
        this.zoneInfo.classList.add('show')
        
        gsap.from(this.zoneInfo, {
            duration: 0.8,
            scale: 0.8,
            opacity: 0,
            ease: "back.out(1.7)"
        })
    }

    hideZoneInfo() {
        if (!this.zoneInfo) return
        
        this.currentZone = null
        
        gsap.to(this.zoneInfo, {
            duration: 0.5,
            scale: 0.8,
            opacity: 0,
            ease: "power2.in",
            onComplete: () => {
                this.zoneInfo.classList.remove('show')
            }
        })
    }

    updateSpeed(speed) {
        const maxSpeed = 80
        const normalizedSpeed = Math.min(speed / maxSpeed, 1)
        const angle = normalizedSpeed * 180 // 0 to 180 degrees

        // Update needle rotation
        if (this.speedNeedle) {
            this.speedNeedle.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`
        }

        // Update speed text
        if (this.speedValue) {
            this.speedValue.textContent = Math.round(speed)
        }

        // Add speed-based effects
        if (this.speedIndicator) {
            if (speed > 50) {
                this.speedIndicator.style.boxShadow = '0 0 30px rgba(255, 107, 157, 0.6)'
            } else if (speed > 25) {
                this.speedIndicator.style.boxShadow = '0 0 20px rgba(78, 205, 196, 0.6)'
            } else {
                this.speedIndicator.style.boxShadow = '0 0 20px rgba(78, 205, 196, 0.3)'
            }
        }
    }

    updateMinimap(carPosition, carRotation) {
        if (!this.minimapCar) return

        // Convert world position to minimap position
        const mapSize = 200
        const worldSize = 200
        
        const mapX = ((carPosition.x + worldSize / 2) / worldSize) * 100
        const mapY = ((carPosition.z + worldSize / 2) / worldSize) * 100

        this.minimapCar.style.left = `${mapX}%`
        this.minimapCar.style.top = `${mapY}%`
        this.minimapCar.style.transform = `translate(-50%, -50%) rotate(${carRotation.y}rad)`
    }

    updateFPS() {
        this.frameCount++
        const currentTime = performance.now()
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
            this.frameCount = 0
            this.lastTime = currentTime
            
            if (this.fpsCounter) {
                this.fpsCounter.textContent = this.fps
                
                // Color code FPS
                if (this.fps >= 55) {
                    this.fpsCounter.style.color = '#4ecdc4' // Cyan for good FPS
                } else if (this.fps >= 30) {
                    this.fpsCounter.style.color = '#ff6b9d' // Pink for medium FPS
                } else {
                    this.fpsCounter.style.color = '#ff4757' // Red for low FPS
                }
            }
        }
    }

    openModal(modal) {
        if (!modal) return

        // Close other modals first
        this.closeAllModals()

        modal.style.display = 'flex'
        modal.classList.add('show')

        // Animate modal in
        const modalContent = modal.querySelector('.modal-content')
        if (modalContent) {
            gsap.from(modalContent, {
                duration: 0.8,
                scale: 0.8,
                opacity: 0,
                ease: "back.out(1.7)"
            })
        }

        // Pause the game or reduce update frequency
        document.body.style.overflow = 'hidden'
    }

    closeModal(modal) {
        if (!modal) return

        const modalContent = modal.querySelector('.modal-content')
        if (modalContent) {
            gsap.to(modalContent, {
                duration: 0.5,
                scale: 0.8,
                opacity: 0,
                ease: "power2.in",
                onComplete: () => {
                    modal.classList.remove('show')
                    modal.style.display = 'none'
                }
            })
        } else {
            modal.classList.remove('show')
            modal.style.display = 'none'
        }

        document.body.style.overflow = 'hidden'
    }

    closeAllModals() {
        this.modals.forEach(modal => {
            if (modal && modal.classList.contains('show')) {
                this.closeModal(modal)
            }
        })
    }

    handleZoneAction() {
        if (!this.currentZone) return

        switch(this.currentZone) {
            case 'Projects Zone':
                this.openModal(this.projectModal)
                break
            case 'About Zone':
                this.openModal(this.aboutModal)
                break
            case 'Contact Zone':
                this.openModal(this.contactModal)
                break
            case 'Skills Zone':
                this.openModal(this.aboutModal)
                break
        }
    }

    toggleMusic() {
        this.musicPlaying = !this.musicPlaying
        
        if (this.musicToggle) {
            const musicIcon = this.musicToggle.querySelector('.music-icon')
            const musicText = this.musicToggle.querySelector('.music-text')
            
            if (musicIcon) {
                musicIcon.textContent = this.musicPlaying ? '🎵' : '🔇'
            }
            if (musicText) {
                musicText.textContent = this.musicPlaying ? 'Music' : 'Muted'
            }
            
            // Add visual feedback
            gsap.from(this.musicToggle, {
                duration: 0.3,
                scale: 1.2,
                ease: "back.out(1.7)"
            })
        }

        // Trigger event for audio manager
        window.dispatchEvent(new CustomEvent('toggleMusic', { detail: this.musicPlaying }))
    }

    handleContactForm(event) {
        const formData = new FormData(event.target)
        const data = Object.fromEntries(formData)

        // Simple validation
        if (!data.name || !data.email || !data.message) {
            this.showNotification('Please fill in all required fields', 'error')
            return
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
            this.showNotification('Please enter a valid email address', 'error')
            return
        }

        // Simulate form submission
        this.showNotification('Message sent successfully! I\'ll get back to you soon.', 'success')
        
        // Reset form
        event.target.reset()
        
        // Close modal after a delay
        setTimeout(() => {
            this.closeModal(this.contactModal)
        }, 2000)
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div')
        notification.className = `notification ${type}`
        notification.textContent = message
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: ${type === 'success' ? 'var(--primary-cyan)' : type === 'error' ? '#ff4757' : 'var(--primary-pink)'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10001;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `

        document.body.appendChild(notification)

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1'
            notification.style.transform = 'translateY(0)'
        }, 100)

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0'
            notification.style.transform = 'translateY(-20px)'
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification)
                }
            }, 300)
        }, 3000)
    }

    checkZoneProximity(carPosition) {
        const zones = [
            { 
                name: 'Projects Zone', 
                position: { x: -30, z: -30 }, 
                radius: 15,
                icon: '💼',
                description: 'Explore my latest projects and see what I\'ve been working on',
                action: 'View Projects'
            },
            { 
                name: 'About Zone', 
                position: { x: 40, z: -40 }, 
                radius: 15,
                icon: '👨‍💻',
                description: 'Learn more about my background, skills, and journey',
                action: 'About Me'
            },
            { 
                name: 'Contact Zone', 
                position: { x: -20, z: 40 }, 
                radius: 15,
                icon: '📧',
                description: 'Get in touch and let\'s create something amazing together',
                action: 'Contact Me'
            },
            { 
                name: 'Skills Zone', 
                position: { x: 50, z: 30 }, 
                radius: 15,
                icon: '⚡',
                description: 'Discover my technical skills and expertise',
                action: 'View Skills'
            }
        ]

        let inZone = false
        
        zones.forEach(zone => {
            const distance = Math.sqrt(
                Math.pow(carPosition.x - zone.position.x, 2) + 
                Math.pow(carPosition.z - zone.position.z, 2)
            )

            if (distance < zone.radius) {
                if (this.currentZone !== zone.name) {
                    this.showZoneInfo(zone)
                }
                inZone = true
            }
        })

        if (!inZone && this.currentZone) {
            this.hideZoneInfo()
        }
    }

    update(car) {
        this.updateFPS()

        if (car && car.mesh) {
            this.updateSpeed(car.speed || 0)
            this.updateMinimap(car.mesh.position, car.mesh.rotation)
            this.checkZoneProximity(car.mesh.position)
        }
    }
}
