class SoundManager {
    constructor() {
        this.sounds = {};
        this.isMuted = false;
        this.volume = 0.7; // Default volume 70%
        this.loaded = false;
        this.loadingPromises = [];
    }

    async initialize() {
        try {
            for (const [key, sound] of Object.entries(audioFiles)) {
                const loadPromise = this.loadSound(key, sound.path);
                this.loadingPromises.push(loadPromise);
            }
            await Promise.all(this.loadingPromises);
            this.loaded = true;
            console.log('All sound effects loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading sound effects:', error);
            return false;
        }
    }

    async loadSound(key, path) {
        try {
            const audio = new Audio();
            audio.volume = this.volume;
            
            // Create a promise to handle audio loading
            const loadPromise = new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => resolve());
                audio.addEventListener('error', (e) => reject(e));
            });

            audio.src = path;
            this.sounds[key] = audio;
            
            await loadPromise;
            return true;
        } catch (error) {
            console.error(`Error loading sound ${key}:`, error);
            return false;
        }
    }

    play(soundKey) {
        if (this.isMuted || !this.sounds[soundKey]) return;
        
        try {
            const sound = this.sounds[soundKey];
            sound.currentTime = 0; // Reset to start
            sound.play().catch(error => {
                console.error(`Error playing ${soundKey}:`, error);
            });
        } catch (error) {
            console.error(`Error playing ${soundKey}:`, error);
        }
    }

    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        Object.values(this.sounds).forEach(sound => {
            sound.muted = this.isMuted;
        });
        return this.isMuted;
    }

    isLoaded() {
        return this.loaded;
    }
}