class NFLQuizGame {
    constructor() {
        // Previous initialization code remains the same
        this.soundManager = new SoundManager();
        this.initializeGame();
    }

    async initializeGame() {
        try {
            await this.soundManager.initialize();
            this.initializeElements();
            this.initializeEventListeners();
            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error initializing game:', error);
            alert('There was an error loading the game sounds. The game will continue without sound effects.');
        }
    }

    initializeElements() {
        // Previous element initialization code remains the same
        
        // Add sound control elements
        this.soundToggle = document.getElementById('toggle-sound');
        this.volumeSlider = document.getElementById('volume-slider');
    }

    initializeEventListeners() {
        // Previous event listeners remain the same
        
        // Add sound control listeners
        this.soundToggle.addEventListener('click', () => {
            const isMuted = this.soundManager.toggleMute();
            this.soundToggle.textContent = isMuted ? '🔈' : '🔊';
        });

        this.volumeSlider.addEventListener('input', (e) => {
            this.soundManager.setVolume(e.target.value / 100);
        });
    }

    startGame() {
        // Previous start game code remains the same
        this.soundManager.play('whistle');
    }

    handleCorrectAnswer() {
        // Previous correct answer code remains the same
        this.soundManager.play('correct');
        
        if (this.yards >= 100) {
            this.soundManager.play('touchdown');
        }
    }

    handleIncorrectAnswer() {
        // Previous incorrect answer code remains the same
        this.soundManager.play('incorrect');
        
        if (this.currentDown > 4) {
            this.soundManager.play('turnover');
        }
    }

    // Rest of the game class remains the same
}