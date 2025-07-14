export class AudioManager {
    constructor() {
        this.context = null
        this.sounds = {}
        this.isInitialized = false
        this.masterVolume = 0.3
        
        this.setupAudioContext()
        this.createSounds()
    }

    setupAudioContext() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)()
            this.masterGain = this.context.createGain()
            this.masterGain.gain.value = this.masterVolume
            this.masterGain.connect(this.context.destination)
        } catch (error) {
            console.warn('Web Audio API not supported:', error)
        }
    }

    createSounds() {
        if (!this.context) return

        // Create synthetic engine sound
        this.createEngineSound()
        
        // Create ambient sounds
        this.createAmbientSound()
        
        // Create UI sounds
        this.createUISound()
    }

    createEngineSound() {
        this.engineOscillator = null
        this.engineGain = this.context.createGain()
        this.engineGain.gain.value = 0
        this.engineGain.connect(this.masterGain)

        this.engineFilter = this.context.createBiquadFilter()
        this.engineFilter.type = 'lowpass'
        this.engineFilter.frequency.value = 200
        this.engineFilter.connect(this.engineGain)
    }

    createAmbientSound() {
        // Create wind/ambient noise
        this.ambientGain = this.context.createGain()
        this.ambientGain.gain.value = 0.1
        this.ambientGain.connect(this.masterGain)

        // Create pink noise for ambient sound
        this.createPinkNoise()
    }

    createPinkNoise() {
        const bufferSize = this.context.sampleRate * 2
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate)
        const output = buffer.getChannelData(0)

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1
            b0 = 0.99886 * b0 + white * 0.0555179
            b1 = 0.99332 * b1 + white * 0.0750759
            b2 = 0.96900 * b2 + white * 0.1538520
            b3 = 0.86650 * b3 + white * 0.3104856
            b4 = 0.55000 * b4 + white * 0.5329522
            b5 = -0.7616 * b5 - white * 0.0168980
            
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
            b6 = white * 0.115926
        }

        this.pinkNoiseBuffer = buffer
    }

    createUISound() {
        this.uiGain = this.context.createGain()
        this.uiGain.gain.value = 0.5
        this.uiGain.connect(this.masterGain)
    }

    playAmbientMusic() {
        if (!this.context || this.isInitialized) return

        // Resume audio context (required by browser policies)
        if (this.context.state === 'suspended') {
            this.context.resume()
        }

        // Start ambient sound
        if (this.pinkNoiseBuffer) {
            this.ambientSource = this.context.createBufferSource()
            this.ambientSource.buffer = this.pinkNoiseBuffer
            this.ambientSource.loop = true
            this.ambientSource.connect(this.ambientGain)
            this.ambientSource.start()
        }

        this.isInitialized = true
    }

    startEngineSound() {
        if (!this.context || this.engineOscillator) return

        this.engineOscillator = this.context.createOscillator()
        this.engineOscillator.type = 'sawtooth'
        this.engineOscillator.frequency.value = 80
        this.engineOscillator.connect(this.engineFilter)
        this.engineOscillator.start()
    }

    stopEngineSound() {
        if (this.engineOscillator) {
            this.engineOscillator.stop()
            this.engineOscillator = null
        }
    }

    updateEngineSound(speed, rpm) {
        if (!this.context || !this.engineOscillator) return

        // Update engine frequency based on speed
        const baseFreq = 80
        const maxFreq = 300
        const freq = baseFreq + (speed / 80) * (maxFreq - baseFreq)
        
        this.engineOscillator.frequency.setValueAtTime(freq, this.context.currentTime)
        
        // Update engine volume
        const volume = Math.min(speed / 80 * 0.3, 0.3)
        this.engineGain.gain.setValueAtTime(volume, this.context.currentTime)
        
        // Update filter frequency for more realistic sound
        const filterFreq = 200 + speed * 10
        this.engineFilter.frequency.setValueAtTime(filterFreq, this.context.currentTime)
    }

    playUISound(type = 'click') {
        if (!this.context) return

        const oscillator = this.context.createOscillator()
        const gain = this.context.createGain()
        
        oscillator.connect(gain)
        gain.connect(this.uiGain)

        switch (type) {
            case 'click':
                oscillator.frequency.value = 800
                gain.gain.setValueAtTime(0.3, this.context.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1)
                break
                
            case 'hover':
                oscillator.frequency.value = 600
                gain.gain.setValueAtTime(0.1, this.context.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05)
                break
                
            case 'success':
                oscillator.frequency.value = 1000
                gain.gain.setValueAtTime(0.2, this.context.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3)
                break
        }

        oscillator.start()
        oscillator.stop(this.context.currentTime + 0.3)
    }

    update(car) {
        if (!car || !this.isInitialized) return

        const speed = car.getSpeed()
        
        // Start/stop engine sound based on movement
        if (speed > 1 && !this.engineOscillator) {
            this.startEngineSound()
        } else if (speed < 0.5 && this.engineOscillator) {
            this.stopEngineSound()
        }

        // Update engine sound
        if (this.engineOscillator) {
            this.updateEngineSound(speed, speed * 100)
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume))
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume
        }
    }

    destroy() {
        if (this.engineOscillator) {
            this.engineOscillator.stop()
        }
        
        if (this.ambientSource) {
            this.ambientSource.stop()
        }
        
        if (this.context) {
            this.context.close()
        }
    }
}
