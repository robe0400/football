class NFLQuizGame {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.yards = 20;         // Starting at own 20-yard line
        this.currentDown = 1;
        this.yardsToGo = 10;
        this.fieldPosition = 20;
        this.possession = true;
        this.synthesis = window.speechSynthesis;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeFormations();
    }

    initializeElements() {
        this.questionText = document.getElementById('question-text');
        this.answerButtons = document.querySelectorAll('.answer-btn');
        this.startButton = document.getElementById('start-game');
        this.readQuestionButton = document.getElementById('read-question');
        this.playerSprite = document.getElementById('player-sprite');
        this.ballSprite = document.getElementById('ball-sprite');
        this.scoreDisplay = document.getElementById('score');
        this.downDisplay = document.getElementById('current-down');
        this.yardsToGoDisplay = document.getElementById('yards-to-go');
        this.fieldPositionDisplay = document.getElementById('field-position');
    }

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
        this.setFormation('offense', 'i-formation');
        this.setFormation('defense', 'defense-43');
    }

    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.readQuestionButton.addEventListener('click', () => this.readCurrentQuestion());
        
        this.answerButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleAnswer(e));
            button.addEventListener('mouseover', (e) => this.readAnswer(e));
        });
    }

    startGame() {
        this.currentQuestion = 0;
        this.score = 0;
        this.fieldPosition = 20;
        this.currentDown = 1;
        this.yardsToGo = 10;
        this.possession = true;
        this.updateDisplay();
        this.displayQuestion();
        this.announceGameStart();
    }

    displayQuestion() {
        const question = questions[this.currentQuestion];
        this.questionText.textContent = question.question;
        
        question.answers.forEach((answer, index) => {
            this.answerButtons[index].textContent = answer;
        });

        this.readCurrentQuestion();
    }

    readCurrentQuestion() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        const question = questions[this.currentQuestion];
        const utterance = new SpeechSynthesisUtterance(question.question);
        utterance.rate = 0.9;
        this.synthesis.speak(utterance);
    }

    readAnswer(e) {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(e.target.textContent);
        utterance.rate = 1;
        this.synthesis.speak(utterance);
    }

    handleAnswer(e) {
        const selectedAnswer = parseInt(e.target.dataset.index);
        const question = questions[this.currentQuestion];
        const correct = selectedAnswer === question.correctAnswer;
        
        if (this.possession) {
            this.handleOffensivePlay(correct);
        } else {
            this.handleDefensivePlay(correct);
        }

        this.updateDisplay();
        
        if (this.currentQuestion < questions.length - 1) {
            this.currentQuestion++;
            setTimeout(() => this.displayQuestion(), 1500);
        } else {
            this.endGame();
        }
    }

    calculateYardsGained(correct) {
        if (correct) {
            const randomNum = Math.random() * 100;
            if (randomNum < 10) return 20 + Math.floor(Math.random() * 30);
            if (randomNum < 30) return 10 + Math.floor(Math.random() * 10);
            return 3 + Math.floor(Math.random() * 7);
        } else {
            const randomNum = Math.random() * 100;
            if (randomNum < 20) return -Math.floor(Math.random() * 5);
            return 0;
        }
    }

    handleOffensivePlay(correct) {
        const yardsGained = this.calculateYardsGained(correct);
        this.fieldPosition += yardsGained;

        if (this.fieldPosition >= 100) {
            this.handleTouchdown();
            return;
        }

        if (this.fieldPosition <= 0) {
            this.handleSafety();
            return;
        }

        if (yardsGained >= this.yardsToGo) {
            this.getFirstDown();
        } else {
            this.yardsToGo -= yardsGained;
            this.currentDown++;
            
            if (this.currentDown > 4) {
                this.handleTurnoverOnDowns();
            }
        }

        this.announcePlay(yardsGained);
        this.moveTeam(yardsGained);
    }

    handleDefensivePlay(correct) {
        if (correct) {
            this.possession = true;
            this.fieldPosition = 100 - this.fieldPosition;
            this.getFirstDown();
            this.announceDefensiveStop();
        } else {
            this.possession = true;
            this.getFirstDown();
            this.announceDefensiveFail();
        }
        this.moveTeam(0);
    }

    setFormation(type, formation) {
        const team = type === 'offense' ? this.offensiveTeam : this.defensiveTeam;
        this.formations[type].forEach(f => team.classList.remove(f));
        team.classList.add(formation);
        this.currentFormation[type] = formation;
    }

    moveTeam(yards) {
        const fieldWidth = document.getElementById('playing-field').offsetWidth;
        const position = (this.fieldPosition / 100) * fieldWidth;
        
        this.offensiveTeam.style.left = `${position}px`;
        this.defensiveTeam.style.left = `${position + 40}px`;
        this.ballSprite.style.left = `${position + 20}px`;
        
        if (Math.random() > 0.7) {
            const newOffFormation = this.formations.offense[
                Math.floor(Math.random() * this.formations.offense.length)
            ];
            this.setFormation('offense', newOffFormation);
        }
    }

    handleTouchdown() {
        this.score += 7;
        this.fieldPosition = 20;
        this.getFirstDown();
        this.announceScore("Touchdown!");
    }

    handleSafety() {
        this.score -= 2;
        this.fieldPosition = 20;
        this.getFirstDown();
        this.announceScore("Safety!");
    }

    getFirstDown() {
        this.currentDown = 1;
        this.yardsToGo = 10;
        this.announceFirstDown();
    }

    handleTurnoverOnDowns() {
        this.possession = false;
        this.fieldPosition = 100 - this.fieldPosition;
        this.announcePlay("Turnover on downs!");
    }

    announceGameStart() {
        const messages = [
            `Welcome to NFL Quiz Football! Starting at your own ${this.fieldPosition} yard line.`,
            `Here we go! The offense takes the field at their own ${this.fieldPosition}.`,
            `It's game time! Ball placed at the ${this.fieldPosition} yard line.`
        ];
        this.speak(this.getRandomMessage(messages));
    }

    announcePlay(yards) {
        if (typeof yards !== "number") {
            this.speak(yards);
            return;
        }

        let playDescription;
        if (yards > 20) {
            playDescription = this.getBigPlayAnnouncement(yards);
        } else if (yards > 10) {
            playDescription = this.getMediumPlayAnnouncement(yards);
        } else if (yards > 0) {
            playDescription = this.getShortGainAnnouncement(yards);
        } else if (yards < 0) {
            playDescription = this.getNegativePlayAnnouncement(yards);
        } else {
            playDescription = this.getNoGainAnnouncement();
        }

        const downAndDistance = this.getDownAndDistance();
        this.speak(`${playDescription} ${downAndDistance}`);
    }

    getBigPlayAnnouncement(yards) {
        const messages = [
            `Wow! A huge play for ${yards} yards!`,
            `What a play! ${yards} yard gain!`,
            `Breaking free for ${yards} yards!`,
            `Amazing run for ${yards} yards!`,
            `Great answer! Breaks loose for ${yards} yards!`
        ];
        return this.getRandomMessage(messages);
    }

    getMediumPlayAnnouncement(yards) {
        const messages = [
            `Nice gain of ${yards} yards!`,
            `Good play! ${yards} yards on that one!`,
            `Moving the chains with a ${yards} yard gain!`,
            `Solid play for ${yards} yards!`,
            `Great answer! ${yards} yard pickup!`
        ];
        return this.getRandomMessage(messages);
    }

    getShortGainAnnouncement(yards) {
        const messages = [
            `Picks up ${yards} yards`,
            `${yards} yard gain on the play`,
            `Moves ahead for ${yards}`,
            `Short gain of ${yards}`,
            `Good for ${yards} yards`
        ];
        return this.getRandomMessage(messages);
    }

    getNegativePlayAnnouncement(yards) {
        const messages = [
            `Lost ${Math.abs(yards)} yards on the play`,
            `Pushed back ${Math.abs(yards)} yards`,
            `That's a loss of ${Math.abs(yards)}`,
            `Goes backward ${Math.abs(yards)} yards`,
            `Tackled for a loss of ${Math.abs(yards)}`
        ];
        return this.getRandomMessage(messages);
    }

    getNoGainAnnouncement() {
        const messages = [
            "No gain on the play",
            "Stopped at the line of scrimmage",
            "Nothing doing on that play",
            "Defense holds for no gain",
            "Stuffed at the line"
        ];
        return this.getRandomMessage(messages);
    }

    announceFirstDown() {
        const messages = [
            "First down!",
            "Moving the chains!",
            "That's enough for a first down!",
            "New set of downs!",
            "First and ten coming up!"
        ];
        this.speak(this.getRandomMessage(messages));
    }

    announceScore(type) {
        let message;
        if (type === "Touchdown!") {
            const tdMessages = [
                "Touchdown! Six points and the extra point is good!",
                "Into the end zone! That's 7 points!",
                "Score! Touchdown and the extra point!",
                "They did it! Touchdown and the PAT is good!",
                "Crossing the goal line! Touchdown plus the extra point!"
            ];
            message = this.getRandomMessage(tdMessages);
        } else if (type === "Safety!") {
            const safetyMessages = [
                "Safety! That's 2 points for the defense!",
                "Tackled in their own end zone! Safety!",
                "Safety! Defense scores 2!",
                "That's a safety! 2 points!"
            ];
            message = this.getRandomMessage(safetyMessages);
        }
        
        this.speak(`${message} Score is now ${this.score}`);
    }

    announceDefensiveStop() {
        const messages = [
            "Defense makes a big stop!",
            "The defense holds!",
            "Stopped by the defense!",
            "That's a defensive stand!",
            "Defense comes up big!"
        ];
        this.speak(this.getRandomMessage(messages));
    }

    announceDefensiveFail() {
        const messages = [
            "Offense converts!",
            "They keep the drive alive!",
            "Moving the chains!",
            "Offense gets a fresh set of downs!",
            "Drive continues!"
        ];
        this.speak(this.getRandomMessage(messages));
    }

    getDownAndDistance() {
        if (this.currentDown > 4) return "Turnover on downs!";
        
        const distance = this.yardsToGo;
        const down = this.getOrdinalNumber(this.currentDown);
        
        if (distance === 1) {
            return `${down} and inches`;
        } else if (distance <= 3) {
            return `${down} and short`;
        } else if (distance >= 10) {
            return `${down} and long`;
        } else {
            return `${down} and ${distance}`;
        }
    }

    getFieldPosition() {
        const yardLine = this.fieldPosition > 50 ? 
            100 - this.fieldPosition : 
            this.fieldPosition;
            
        if (this.fieldPosition === 50) {
            return "Midfield";
        } else if (this.fieldPosition > 50) {
            return yardLine === 0 ? "Goal line!" : `Opponent's ${yardLine}`;
        } else {
            return `Own ${yardLine}`;
        }
    }

    getOrdinalNumber(num) {
        const suffixes = ["st", "nd", "rd", "th"];
        const suffix = num <= 3 ? suffixes[num - 1] : suffixes[3];
        return `${num}${suffix}`;
    }

    speak(message) {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        this.synthesis.speak(utterance);
    }

    getRandomMessage(messages) {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.downDisplay.textContent = this.currentDown;
        this.yardsToGoDisplay.textContent = this.yardsToGo;
        this.fieldPositionDisplay.textContent = this.getFieldPosition();
    }

    endGame() {
        const utterance = new SpeechSynthesisUtterance(`Game Over! Final score: ${this.score} points!`);
        this.synthesis.speak(utterance);
        alert(`Game Over! Final score: ${this.score} points!`);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const game = new NFLQuizGame();
});