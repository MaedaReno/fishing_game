class UIManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.bubbles = [];
    }

    initCanvas() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createBubbles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createBubbles() {
        for (let i = 0; i < 50; i++) {
            this.bubbles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height + this.canvas.height,
                size: Math.random() * 5 + 2,
                speed: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 背景グラデーション
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#0a192f');
        grad.addColorStop(1, '#020c1b');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 気泡のアニメーション
        this.bubbles.forEach(b => {
            b.y -= b.speed;
            if (b.y < -20) {
                b.y = this.canvas.height + 20;
                b.x = Math.random() * this.canvas.width;
            }
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity})`;
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

const ui = new UIManager();
