import * as THREE from 'three';

export class AudioManager {
    constructor(camera) {
        this.camera = camera;
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);
        
        this.sounds = {};
        this.audioContext = null;
        this.isInitialized = false;
        this.lastFootstepTime = 0;
        this.footstepInterval = 0.4;
        
        // Initialize on user interaction
        document.addEventListener('click', () => this.init(), { once: true });
        document.addEventListener('keydown', () => this.init(), { once: true });
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        // Create AudioContext
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Generate sounds procedurally
        this.createAmbience();
        this.createFootstepSound();
        this.createMechanicalClunk();
        this.createDigitalBlip();
        this.createSparkSound();
        this.createCRTSound();
    }

    createAmbience() {
        // Low frequency industrial hum
        const duration = 10;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, sampleRate * duration, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                
                // Base hum (low frequency)
                let sample = Math.sin(t * 60 * Math.PI * 2) * 0.15;
                
                // Harmonics
                sample += Math.sin(t * 120 * Math.PI * 2) * 0.08;
                sample += Math.sin(t * 180 * Math.PI * 2) * 0.04;
                
                // Subtle variations
                sample += Math.sin(t * 0.5 * Math.PI * 2) * Math.sin(t * 90 * Math.PI * 2) * 0.05;
                
                // Random crackling
                if (Math.random() < 0.0001) {
                    sample += (Math.random() - 0.5) * 0.3;
                }
                
                data[i] = sample;
            }
        }
        
        const sound = new THREE.Audio(this.listener);
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.3);
        sound.play();
        
        this.sounds.ambience = sound;
    }

    createFootstepSound() {
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 30);
            
            // Metallic impact
            let sample = Math.sin(t * 200 * Math.PI * 2) * envelope;
            sample += Math.sin(t * 450 * Math.PI * 2) * envelope * 0.5;
            sample += Math.sin(t * 800 * Math.PI * 2) * envelope * 0.2;
            
            // Add some noise for grit
            sample += (Math.random() - 0.5) * envelope * 0.3;
            
            data[i] = sample * 0.4;
        }
        
        this.sounds.footstep = buffer;
    }

    createMechanicalClunk() {
        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8);
            
            // Heavy mechanical impact
            let sample = Math.sin(t * 80 * Math.PI * 2) * envelope;
            sample += Math.sin(t * 160 * Math.PI * 2) * envelope * 0.6;
            sample += Math.sin(t * 320 * Math.PI * 2) * envelope * 0.3;
            
            // Resonance
            sample += Math.sin(t * 40 * Math.PI * 2) * Math.exp(-t * 4) * 0.5;
            
            // Metal rattle
            if (t > 0.1) {
                const rattleEnv = Math.exp(-(t - 0.1) * 15);
                sample += Math.sin(t * 600 * Math.PI * 2) * rattleEnv * 0.2;
            }
            
            data[i] = sample * 0.5;
        }
        
        this.sounds.mechanicalClunk = buffer;
    }

    createDigitalBlip() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 40);
            
            // Digital tone
            let sample = Math.sin(t * 1200 * Math.PI * 2) * envelope;
            sample += Math.sin(t * 1800 * Math.PI * 2) * envelope * 0.5;
            
            // Square wave component for digital feel
            sample += (Math.sin(t * 800 * Math.PI * 2) > 0 ? 1 : -1) * envelope * 0.1;
            
            data[i] = sample * 0.2;
        }
        
        this.sounds.digitalBlip = buffer;
    }

    createSparkSound() {
        const duration = 0.3;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 15);
            
            // Electrical crackle
            let sample = (Math.random() - 0.5) * envelope;
            
            // High frequency zaps
            sample += Math.sin(t * 3000 * Math.PI * 2) * Math.random() * envelope * 0.5;
            sample += Math.sin(t * 5000 * Math.PI * 2) * Math.random() * envelope * 0.3;
            
            data[i] = sample * 0.3;
        }
        
        this.sounds.spark = buffer;
    }

    createCRTSound() {
        const duration = 0.8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            
            // CRT turn-on sound
            const startEnvelope = 1 - Math.exp(-t * 20);
            const endEnvelope = Math.exp(-(t - 0.3) * 3);
            const envelope = Math.min(startEnvelope, endEnvelope > 0 ? endEnvelope : 0);
            
            // High frequency whine that sweeps down
            const freq = 15000 * Math.exp(-t * 5) + 100;
            let sample = Math.sin(t * freq * Math.PI * 2) * envelope * 0.3;
            
            // Static noise
            sample += (Math.random() - 0.5) * envelope * 0.2;
            
            // Low thump
            if (t < 0.2) {
                sample += Math.sin(t * 60 * Math.PI * 2) * Math.exp(-t * 10) * 0.5;
            }
            
            data[i] = sample * 0.4;
        }
        
        this.sounds.crtOn = buffer;
    }

    playSound(soundName, volume = 1) {
        if (!this.isInitialized) return;
        
        const buffer = this.sounds[soundName];
        if (!buffer) return;
        
        // Don't play buffers that are actually Audio objects (like ambience)
        if (buffer instanceof THREE.Audio) return;
        
        const sound = new THREE.Audio(this.listener);
        sound.setBuffer(buffer);
        sound.setVolume(volume);
        sound.play();
        
        // Clean up after playing
        sound.onEnded = () => {
            sound.disconnect();
        };
    }

    playFootstep(elapsed) {
        if (!this.isInitialized) return;
        
        if (elapsed - this.lastFootstepTime > this.footstepInterval) {
            this.lastFootstepTime = elapsed;
            
            // Vary the pitch slightly
            const sound = new THREE.Audio(this.listener);
            sound.setBuffer(this.sounds.footstep);
            sound.setVolume(0.3 + Math.random() * 0.2);
            sound.setPlaybackRate(0.9 + Math.random() * 0.2);
            sound.play();
            
            sound.onEnded = () => {
                sound.disconnect();
            };
        }
    }

    play3DSound(soundName, position, volume = 1) {
        if (!this.isInitialized) return;
        
        const buffer = this.sounds[soundName];
        if (!buffer || buffer instanceof THREE.Audio) return;
        
        const sound = new THREE.PositionalAudio(this.listener);
        sound.setBuffer(buffer);
        sound.setRefDistance(5);
        sound.setVolume(volume);
        sound.position.copy(position);
        sound.play();
        
        sound.onEnded = () => {
            sound.disconnect();
        };
    }

    setAmbienceVolume(volume) {
        if (this.sounds.ambience) {
            this.sounds.ambience.setVolume(volume);
        }
    }

    mute() {
        this.listener.setMasterVolume(0);
    }

    unmute() {
        this.listener.setMasterVolume(1);
    }

    dispose() {
        Object.values(this.sounds).forEach(sound => {
            if (sound instanceof THREE.Audio) {
                sound.stop();
                sound.disconnect();
            }
        });
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
