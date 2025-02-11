// Add these methods to your NFLQuizGame class

class NFLQuizGame {
    // ... (previous code remains the same)

    initializeFormations() {
        this.offensiveTeam = document.getElementById('offensive-team');
        this.defensiveTeam = document.getElementById('defensive-team');
        this.formations = {
            offense: ['i-formation', 'shotgun-formation'],
            defense: ['defense-43']
        };
        this.currentFormation = {
            offense: 'i-formation',
            defense: 'defense-43'
        };
    }

    setFormation(type, formation) {
        const team = type === 'offense' ? this.offensiveTeam : this.defensiveTeam;
        // Remove all formation classes
        this.formations[type].forEach(f => team.classList.remove(f));
        // Add new formation class
        team.classList.add(formation);
        this.currentFormation[type] = formation;
    }

    moveTeam(yards) {
        const fieldWidth = document.getElementById('playing-field').offsetWidth;
        const position = (this.fieldPosition / 100) * fieldWidth;
        
        // Move offensive team
        this.offensiveTeam.style.left = `${position}px`;
        
        // Move defensive team slightly ahead of offense
        this.defensiveTeam.style.left = `${position + 40}px`;
        
        // Move ball with quarterback
        const ballSprite = document.getElementById('ball-sprite');
        ballSprite.style.left = `${position + 20}px`;
        
        // Randomly change formations for variety
        if (Math.random() > 0.7) {
            const newOffFormation = this.formations.offense[
                Math.floor(Math.random() * this.formations.offense.length)
            ];
            this.setFormation('offense', newOffFormation);
        }
    }

    handleCorrectAnswer() {
        // ... (previous code)
        this.moveTeam(yardsGained);
        // ... (rest of the code)
    }

    handleIncorrectAnswer() {
        // ... (previous code)
        this.moveTeam(0);
        // ... (rest of the code)
    }
}