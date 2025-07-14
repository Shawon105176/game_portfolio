import { gsap } from 'gsap'

export class LoadingManager {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen')
        this.loadingProgress = document.querySelector('.loading-progress')
        this.loadingPercentage = document.querySelector('.loading-percentage')
        
        this.itemsToLoad = 10 // Simulate loading items
        this.itemsLoaded = 0
        this.callbacks = {}
    }

    on(event, callback) {
        this.callbacks[event] = callback
    }

    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event](data)
        }
    }

    startLoading() {
        this.updateProgress(0)
        
        // Check if Three.js is loaded
        if (typeof THREE === 'undefined') {
            console.log('Waiting for Three.js to load...')
            setTimeout(() => this.startLoading(), 100)
            return
        }
        
        this.simulateLoading()
    }

    simulateLoading() {
        // Simulate loading different assets
        const loadingSteps = [
            { name: 'Loading 3D Models...', duration: 800 },
            { name: 'Initializing Physics...', duration: 600 },
            { name: 'Setting up Environment...', duration: 700 },
            { name: 'Loading Textures...', duration: 500 },
            { name: 'Compiling Shaders...', duration: 400 },
            { name: 'Setting up Audio...', duration: 300 },
            { name: 'Building World...', duration: 600 },
            { name: 'Optimizing Performance...', duration: 400 },
            { name: 'Final Preparations...', duration: 500 },
            { name: 'Ready to Drive!', duration: 300 }
        ]

        let totalDuration = 0
        
        loadingSteps.forEach((step, index) => {
            setTimeout(() => {
                this.updateLoadingText(step.name)
                this.updateProgress((index + 1) / loadingSteps.length * 100)
                
                if (index === loadingSteps.length - 1) {
                    setTimeout(() => {
                        this.onLoadingComplete()
                    }, step.duration)
                }
            }, totalDuration)
            
            totalDuration += step.duration
        })
    }

    updateProgress(percentage) {
        this.loadingProgress.style.width = `${percentage}%`
        this.loadingPercentage.textContent = `${Math.round(percentage)}%`
    }

    updateLoadingText(text) {
        const loadingText = document.querySelector('.loading-text')
        
        gsap.to(loadingText, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
                loadingText.textContent = text
                gsap.to(loadingText, {
                    opacity: 1,
                    duration: 0.2
                })
            }
        })
    }

    onLoadingComplete() {
        this.updateProgress(100)
        
        // Wait a moment then emit loaded event
        setTimeout(() => {
            this.emit('loaded')
        }, 500)
    }
}
