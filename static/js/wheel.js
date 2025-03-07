class WheelGame {
    constructor() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.prizes = ['No luck', '100 BIFN', '50 BIFN', '20 BIFN'];
        this.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.targetRotation = 0;
        this.spinButton = document.getElementById('spinButton');
        this.emailForm = document.getElementById('emailForm');
        this.resultDiv = document.getElementById('result');

        this.init();
    }

    init() {
        // Make canvas responsive
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initial wheel draw
        this.drawWheel();
        
        // Event listeners
        this.spinButton.addEventListener('click', () => this.spin());
        this.emailForm.addEventListener('submit', (e) => this.handleEmailSubmit(e));
    }

    resizeCanvas() {
        const size = Math.min(window.innerWidth * 0.8, 500);
        this.canvas.width = size;
        this.canvas.height = size;
        this.drawWheel();
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = this.canvas.width * 0.4;

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.currentRotation);

        // Draw segments
        const segmentAngle = (2 * Math.PI) / this.prizes.length;
        this.prizes.forEach((prize, i) => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, radius, i * segmentAngle, (i + 1) * segmentAngle);
            this.ctx.fillStyle = this.colors[i];
            this.ctx.fill();
            
            // Draw text
            this.ctx.save();
            this.ctx.rotate(i * segmentAngle + segmentAngle / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText(prize, radius - 10, 5);
            this.ctx.restore();
        });

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();

        this.ctx.restore();
    }

    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinButton.disabled = true;
        
        // Random number of full rotations plus segment
        const rotations = 4 + Math.random() * 4;
        this.targetRotation = this.currentRotation + (rotations * 2 * Math.PI);
        
        this.animate();
    }

    animate() {
        const ease = (t) => 1 - Math.pow(1 - t, 4);
        const duration = 4000;
        const startTime = Date.now();
        const startRotation = this.currentRotation;
        const rotationDiff = this.targetRotation - startRotation;

        const animateFrame = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.currentRotation = startRotation + rotationDiff * ease(progress);
            this.drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                this.isSpinning = false;
                this.spinButton.disabled = false;
                this.handleSpinComplete();
            }
        };

        requestAnimationFrame(animateFrame);
    }

    handleSpinComplete() {
        const normalizedRotation = this.currentRotation % (2 * Math.PI);
        const segmentAngle = (2 * Math.PI) / this.prizes.length;
        const winningIndex = Math.floor(
            (2 * Math.PI - normalizedRotation) / segmentAngle
        ) % this.prizes.length;
        const prize = this.prizes[winningIndex];

        // Add celebration effects to wheel container
        const wheelContainer = this.canvas.parentElement;
        wheelContainer.classList.add('celebration');
        setTimeout(() => wheelContainer.classList.remove('celebration'), 500);

        if (prize === 'No luck') {
            this.resultDiv.innerHTML = '<p class="text-danger">Better luck next time!</p>';
            this.emailForm.style.display = 'none';
        } else {
            // Enhanced winning message with celebration
            this.resultDiv.innerHTML = `
                <div class="win-message">
                    🎉 Congratulations! 🎉
                    <br>
                    You won ${prize}!
                </div>
                <p class="text-success">Enter your email below to claim your prize!</p>
            `;
            this.emailForm.style.display = 'block';
            document.getElementById('prizefield').value = prize;
        }
    }

    async handleEmailSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const prize = document.getElementById('prizefield').value;

        try {
            const response = await fetch('/collect-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, prize }),
            });

            const data = await response.json();
            
            if (data.success) {
                this.emailForm.style.display = 'none';
                this.resultDiv.innerHTML += '<p class="text-success">Prize claimed successfully!</p>';
            } else {
                this.resultDiv.innerHTML += '<p class="text-danger">Error claiming prize. Please try again.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            this.resultDiv.innerHTML += '<p class="text-danger">Error claiming prize. Please try again.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WheelGame();
});