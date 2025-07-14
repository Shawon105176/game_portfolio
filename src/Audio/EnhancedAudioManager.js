export class AudioManager {
    constructor() {
        this.context = null
        this.sounds = {}
        this.isInitialized = false
        this.isMuted = false
        this.masterVolume = 0.3
        
        this.setupAudioContext()
        this.setupEventListeners()
        this.createSynthSounds()
    }

    setupAudioContext() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)()
            this.masterGain = this.context.createGain()
            this.masterGain.connect(this.context.destination)
            this.masterGain.gain.value = this.masterVolume
            
            // Create reverb
            this.createReverb()
            
            this.isInitialized = true
        } catch (error) {
            console.warn('Web Audio API not supported:', error)
        }
    }

    setupEventListeners() {
        // Listen for music toggle
        window.addEventListener('toggleMusic', (e) => {
            this.isMuted = !e.detail
            this.setMasterVolume(this.isMuted ? 0 : this.masterVolume)
        })

        // Resume audio context on user interaction
        document.addEventListener('click', () => {
            if (this.context && this.context.state === 'suspended') {
                this.context.resume()
            }
        }, { once: true })
    }

    createReverb() {
        if (!this.context) return

        // Create convolution reverb
        this.reverb = this.context.createConvolver()
        this.reverbGain = this.context.createGain()
        this.reverbGain.gain.value = 0.2

        // Create impulse response for reverb
        const sampleRate = this.context.sampleRate
        const length = sampleRate * 2 // 2 seconds
        const impulse = this.context.createBuffer(2, length, sampleRate)

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel)
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
            }
        }

        this.reverb.buffer = impulse
        this.reverb.connect(this.reverbGain)
        this.reverbGain.connect(this.masterGain)
    }

    createSynthSounds() {
        if (!this.context) return

        // Create ambient background music
        this.createAmbientMusic()
        
        // Create engine sound
        this.createEngineSound()
        
        // Create UI sounds
        this.createUISounds()
    }

    createAmbientMusic() {
        if (!this.context) return

        // Create oscillators for ambient chord progression
        this.ambientOscillators = []
        const frequencies = [
            [130.81, 164.81, 196.00, 246.94], // C major 7
            [138.59, 174.61, 207.65, 261.63], // D minor 7
            [146.83, 185.00, 220.00, 277.18], // E minor 7
            [174.61, 220.00, 261.63, 329.63]  // F major 7
        ]

        frequencies.forEach((chord, chordIndex) => {
            chord.forEach((freq, noteIndex) => {
                const osc = this.context.createOscillator()
                const gain = this.context.createGain()
                const filter = this.context.createBiquadFilter()

                osc.type = 'sine'
                osc.frequency.value = freq
                
                filter.type = 'lowpass'
                filter.frequency.value = 800
                filter.Q.value = 1

                gain.gain.value = 0.02 // Very quiet ambient
                
                osc.connect(filter)
                filter.connect(gain)
                gain.connect(this.reverb)
                gain.connect(this.masterGain)

                this.ambientOscillators.push({ osc, gain, filter, freq, chordIndex, noteIndex })
            })
        })
    }

    createEngineSound() {
        if (!this.context) return

        // Create engine noise
        this.engineOsc = this.context.createOscillator()
        this.engineGain = this.context.createGain()
        this.engineFilter = this.context.createBiquadFilter()

        this.engineOsc.type = 'sawtooth'
        this.engineOsc.frequency.value = 80
        
        this.engineFilter.type = 'lowpass'
        this.engineFilter.frequency.value = 200
        this.engineFilter.Q.value = 5

        this.engineGain.gain.value = 0

        this.engineOsc.connect(this.engineFilter)
        this.engineFilter.connect(this.engineGain)
        this.engineGain.connect(this.masterGain)
    }

    createUISounds() {
        // Create UI interaction sounds using synthesis
        this.uiSounds = {
            hover: () => this.playTone(440, 0.1, 0.02, 'sine'),
            click: () => this.playTone(880, 0.05, 0.05, 'square'),
            zone: () => this.playChord([261.63, 329.63, 392.00], 0.3, 0.1),
            notification: () => this.playTone(523.25, 0.2, 0.08, 'triangle')
        }
    }

    playTone(frequency, duration, volume, type = 'sine') {
        if (!this.context || this.isMuted) return

        const osc = this.context.createOscillator()
        const gain = this.context.createGain()
        const filter = this.context.createBiquadFilter()

        osc.type = type
        osc.frequency.value = frequency

        filter.type = 'lowpass'
        filter.frequency.value = frequency * 2
        filter.Q.value = 1

        gain.gain.value = 0
        gain.gain.setValueAtTime(0, this.context.currentTime)
        gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.masterGain)

        osc.start(this.context.currentTime)
        osc.stop(this.context.currentTime + duration)
    }

    playChord(frequencies, duration, volume) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, duration, volume / frequencies.length, 'sine')
            }, index * 50)
        })
    }

    startAmbientMusic() {
        if (!this.context || !this.ambientOscillators.length || this.isMuted) return

        this.ambientOscillators.forEach(({ osc }) => {
            if (osc.context.state !== 'closed') {
                try {
                    osc.start()
                } catch (e) {
                    // Oscillator already started
                }
            }
        })

        // Animate chord progression
        this.animateAmbientMusic()
    }

    animateAmbientMusic() {
        if (!this.ambientOscillators.length) return

        let currentChord = 0
        const chordDuration = 8000 // 8 seconds per chord

        const changeChord = () => {
            this.ambientOscillators.forEach(({ gain, chordIndex }) => {
                const targetVolume = chordIndex === currentChord ? 0.02 : 0.005
                
                if (gain.gain.value !== targetVolume) {
                    gain.gain.exponentialRampToValueAtTime(
                        targetVolume, 
                        this.context.currentTime + 2
                    )
                }
            })

            currentChord = (currentChord + 1) % 4
            setTimeout(changeChord, chordDuration)
        }

        changeChord()
    }

    startEngineSound() {
        if (!this.context || !this.engineOsc || this.isMuted) return

        try {
            this.engineOsc.start()
        } catch (e) {
            // Already started
        }
    }

    updateEngineSound(speed) {
        if (!this.engineGain || !this.engineFilter || !this.engineOsc) return

        const normalizedSpeed = Math.min(speed / 80, 1)
        
        // Update volume based on speed
        const targetVolume = normalizedSpeed * 0.1
        this.engineGain.gain.exponentialRampToValueAtTime(
            Math.max(targetVolume, 0.001), 
            this.context.currentTime + 0.1
        )

        // Update frequency based on speed
        const targetFreq = 80 + (normalizedSpeed * 200)
        this.engineOsc.frequency.exponentialRampToValueAtTime(
            targetFreq, 
            this.context.currentTime + 0.1
        )

        // Update filter frequency
        const filterFreq = 200 + (normalizedSpeed * 800)
        this.engineFilter.frequency.exponentialRampToValueAtTime(
            filterFreq, 
            this.context.currentTime + 0.1
        )
    }

    playUISound(soundName) {
        if (this.uiSounds[soundName]) {
            this.uiSounds[soundName]()
        }
    }

    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.exponentialRampToValueAtTime(
                Math.max(volume, 0.001), 
                this.context.currentTime + 0.1
            )
        }
    }

    playAmbientMusic() {
        this.startAmbientMusic()
        this.startEngineSound()
    }

    update(car) {
        if (car && car.speed !== undefined) {
            this.updateEngineSound(car.speed)
        }
    }

    destroy() {
        if (this.context) {
            this.ambientOscillators?.forEach(({ osc }) => {
                try {
                    osc.stop()
                } catch (e) {}
            })
            
            try {
                this.engineOsc?.stop()
            } catch (e) {}
            
            this.context.close()
        }
    }
}
