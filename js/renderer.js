/* ============================================
   さかな超大戦 - Canvas描画エンジン
   水中背景、魚影、光線、気泡などの描画
   ============================================ */

class Renderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.w = 0;
        this.h = 0;
        this.time = 0;
        this.bubbles = [];
        this.lightRays = [];
        this.waterLevel = 0.35; // 画面上から35%が水面
        this.currentSpot = null;
        this.particles = [];
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.panY = 0;
        this.targetPanY = 0;
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createBubbles(60);
        this.createLightRays(8);
        this.loop();
    }

    resize() {
        this.w = this.canvas.width = window.innerWidth;
        this.h = this.canvas.height = window.innerHeight;
    }

    setSpot(spot) {
        this.currentSpot = spot;
    }

    getScreenPos(x, y) {
        const waterY = this.h * this.waterLevel;
        return {
            x: this.w / 2 + (x - this.w / 2) * this.zoom,
            y: this.panY + waterY + (y - waterY) * this.zoom
        };
    }

    /* ---- 気泡の生成 ---- */
    createBubbles(count) {
        this.bubbles = [];
        for (let i = 0; i < count; i++) {
            this.bubbles.push(this._newBubble(true));
        }
    }

    _newBubble(randomY) {
        return {
            x: Math.random() * this.w,
            y: randomY ? (this.h * this.waterLevel) + Math.random() * (this.h * (1 - this.waterLevel)) : this.h + 10,
            size: Math.random() * 4 + 1.5,
            speed: Math.random() * 1.5 + 0.5,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.02 + 0.01,
            opacity: Math.random() * 0.4 + 0.1
        };
    }

    /* ---- 光線の生成 ---- */
    createLightRays(count) {
        this.lightRays = [];
        for (let i = 0; i < count; i++) {
            this.lightRays.push({
                x: Math.random() * this.w,
                width: Math.random() * 80 + 30,
                opacity: Math.random() * 0.06 + 0.02,
                speed: Math.random() * 0.3 + 0.1,
                angle: (Math.random() - 0.5) * 0.3
            });
        }
    }

    /* ---- パーティクルエフェクト ---- */
    addSplash(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 8 - 2,
                size: Math.random() * 4 + 2,
                life: 1.0,
                decay: Math.random() * 0.03 + 0.02,
                color: `hsl(${190 + Math.random() * 20}, 80%, 70%)`
            });
        }
    }

    addRipple(x, y) {
        this.particles.push({
            x, y,
            vx: 0, vy: 0,
            size: 5,
            life: 1.0,
            decay: 0.015,
            isRipple: true,
            maxRadius: 60
        });
    }

    /* =========== メインループ =========== */
    loop() {
        this.time += 0.016;
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    draw() {
        const { ctx, w, h } = this;
        ctx.clearRect(0, 0, w, h);

        const waterY = h * this.waterLevel;
        this.zoom += (this.targetZoom - this.zoom) * 0.05;
        this.panY += (this.targetPanY - this.panY) * 0.05;

        ctx.save();
        ctx.translate(0, this.panY);
        ctx.translate(w / 2, waterY);
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(-w / 2, -waterY);

        this.drawSky(waterY);
        this.drawWater(waterY);
        this.drawLightRays(waterY);
        this.drawBubbles(waterY);
        this.drawWaterSurface(waterY);
        this.drawParticles();
        
        ctx.restore();
    }

    /* ---- 空 ---- */
    drawSky(waterY) {
        const { ctx, w, h } = this;
        let c1 = '#0d1b2a', c2 = '#1b2838';
        if (this.currentSpot) {
            c1 = this.currentSpot.bgGradient[0];
            c2 = this.currentSpot.bgGradient[1];
        }

        ctx.fillStyle = c1;
        ctx.fillRect(0, -h, w, h);

        const grad = ctx.createLinearGradient(0, 0, 0, waterY);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, waterY);

        // 星
        if (this.currentSpot && this.currentSpot.id === 'abyss') return;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let i = 0; i < 40; i++) {
            const sx = (i * 137.5 + this.time * 2) % w;
            const sy = (i * 97.3) % (waterY * 0.8);
            const ss = Math.sin(this.time * 2 + i) * 0.5 + 1;
            ctx.beginPath();
            ctx.arc(sx, sy, ss, 0, Math.PI * 2);
            ctx.fill();
        }

        // 月
        ctx.fillStyle = 'rgba(255, 250, 230, 0.9)';
        ctx.beginPath();
        ctx.arc(w * 0.8, waterY * 0.25, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 250, 230, 0.1)';
        ctx.beginPath();
        ctx.arc(w * 0.8, waterY * 0.25, 60, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ---- 水中 ---- */
    drawWater(waterY) {
        const { ctx, w, h } = this;
        let wColor = 'rgba(10, 40, 80, 0.9)';
        if (this.currentSpot) {
            wColor = this.currentSpot.waterColor;
        }
        const grad = ctx.createLinearGradient(0, waterY, 0, h);
        grad.addColorStop(0, 'rgba(20, 80, 140, 0.7)');
        grad.addColorStop(0.3, wColor);
        grad.addColorStop(1, 'rgba(2, 8, 20, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, waterY, w, h - waterY);
    }

    /* ---- 水面の波 ---- */
    drawWaterSurface(waterY) {
        const { ctx, w } = this;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, waterY);
        for (let x = 0; x <= w; x += 4) {
            const wave1 = Math.sin(x * 0.015 + this.time * 1.5) * 6;
            const wave2 = Math.sin(x * 0.03 + this.time * 2.2) * 3;
            const wave3 = Math.sin(x * 0.008 + this.time * 0.8) * 8;
            ctx.lineTo(x, waterY + wave1 + wave2 + wave3);
        }
        ctx.lineTo(w, waterY - 20);
        ctx.lineTo(0, waterY - 20);
        ctx.closePath();

        const surfGrad = ctx.createLinearGradient(0, waterY - 10, 0, waterY + 15);
        surfGrad.addColorStop(0, 'rgba(100, 200, 255, 0.0)');
        surfGrad.addColorStop(0.4, 'rgba(100, 200, 255, 0.3)');
        surfGrad.addColorStop(0.6, 'rgba(200, 240, 255, 0.5)');
        surfGrad.addColorStop(1, 'rgba(100, 200, 255, 0.1)');
        ctx.fillStyle = surfGrad;
        ctx.fill();
        ctx.restore();
    }

    /* ---- 光線 ---- */
    drawLightRays(waterY) {
        const { ctx, w, h } = this;
        this.lightRays.forEach(r => {
            r.x += r.speed * Math.sin(this.time * 0.5);
            if (r.x > w + 100) r.x = -100;
            if (r.x < -100) r.x = w + 100;

            ctx.save();
            ctx.globalAlpha = r.opacity * (0.7 + Math.sin(this.time + r.x) * 0.3);
            ctx.beginPath();
            ctx.moveTo(r.x, waterY);
            ctx.lineTo(r.x + r.width * 0.5 + r.angle * (h - waterY), h);
            ctx.lineTo(r.x - r.width * 0.5 + r.angle * (h - waterY), h);
            ctx.closePath();
            const rayGrad = ctx.createLinearGradient(0, waterY, 0, h);
            rayGrad.addColorStop(0, 'rgba(100, 220, 255, 0.8)');
            rayGrad.addColorStop(1, 'rgba(100, 220, 255, 0)');
            ctx.fillStyle = rayGrad;
            ctx.fill();
            ctx.restore();
        });
    }

    /* ---- 気泡 ---- */
    drawBubbles(waterY) {
        const { ctx, w, h } = this;
        this.bubbles.forEach(b => {
            b.y -= b.speed;
            b.wobble += b.wobbleSpeed;
            b.x += Math.sin(b.wobble) * 0.5;

            if (b.y < waterY) {
                Object.assign(b, this._newBubble(false));
                b.y = h + 10;
            }

            ctx.save();
            ctx.globalAlpha = b.opacity;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(200, 240, 255, 0.6)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            // ハイライト
            ctx.beginPath();
            ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fill();
            ctx.restore();
        });
    }

    /* ---- パーティクル ---- */
    drawParticles() {
        const { ctx } = this;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= p.decay;
            if (p.life <= 0) { this.particles.splice(i, 1); continue; }

            if (p.isRipple) {
                const r = p.maxRadius * (1 - p.life);
                ctx.save();
                ctx.globalAlpha = p.life * 0.5;
                ctx.strokeStyle = 'rgba(200, 240, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, r, r * 0.3, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            } else {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // 重力
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    /* =========== 魚の描画 =========== */
    drawFish(fish, x, y, scale, isShadow, facingLeft) {
        const { ctx } = this;
        ctx.save();
        ctx.translate(x, y);
        if (facingLeft) ctx.scale(-1, 1);
        ctx.scale(scale, scale);

        const s = fish.size;

        if (isShadow) {
            // 魚影 (暗いシルエット)
            ctx.globalAlpha = 0.35;
            ctx.fillStyle = '#0a1628';
            this._drawFishShape(ctx, s, fish);
        } else {
            // 本体描画
            ctx.globalAlpha = 1;
            this._drawFishBody(ctx, s, fish);
        }

        ctx.restore();
    }

    _drawFishShape(ctx, s, fish) {
        // 汎用魚型シルエット
        ctx.beginPath();
        ctx.ellipse(0, 0, s, s * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        // 尾びれ
        ctx.beginPath();
        ctx.moveTo(-s * 0.8, 0);
        ctx.lineTo(-s * 1.3, -s * 0.4);
        ctx.lineTo(-s * 1.3, s * 0.4);
        ctx.closePath();
        ctx.fill();
    }

    _drawFishBody(ctx, s, fish) {
        // --- 本体 ---
        const grad = ctx.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
        grad.addColorStop(0, fish.bodyColor);
        grad.addColorStop(0.5, fish.color);
        grad.addColorStop(1, fish.finColor);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, s, s * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();

        // --- 尾びれ ---
        ctx.fillStyle = fish.finColor;
        ctx.beginPath();
        ctx.moveTo(-s * 0.7, 0);
        ctx.quadraticCurveTo(-s * 1.1, -s * 0.15, -s * 1.3, -s * 0.45);
        ctx.quadraticCurveTo(-s * 0.95, 0, -s * 1.3, s * 0.45);
        ctx.quadraticCurveTo(-s * 1.1, s * 0.15, -s * 0.7, 0);
        ctx.fill();

        // --- 背びれ ---
        ctx.fillStyle = fish.finColor;
        ctx.beginPath();
        ctx.moveTo(-s * 0.2, -s * 0.35);
        ctx.quadraticCurveTo(0, -s * 0.7, s * 0.3, -s * 0.35);
        ctx.fill();

        // --- 目 ---
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s * 0.55, -s * 0.05, s * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(s * 0.58, -s * 0.05, s * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // --- 光沢 ---
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(s * 0.1, -s * 0.15, s * 0.5, s * 0.1, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /* ---- 桟橋（手前の足場） ---- */
    drawDock() {
        const { ctx, w, h } = this;
        const dockY = h * 0.82;
        ctx.save();
        // 桟橋の板
        const grad = ctx.createLinearGradient(0, dockY, 0, h);
        grad.addColorStop(0, '#5d4037');
        grad.addColorStop(0.3, '#4e342e');
        grad.addColorStop(1, '#3e2723');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, dockY);
        ctx.lineTo(w * 0.85, dockY);
        ctx.lineTo(w * 0.95, h);
        ctx.lineTo(w * 0.05, h);
        ctx.closePath();
        ctx.fill();
        // 板の線
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 6; i++) {
            const ly = dockY + (h - dockY) * (i / 6);
            ctx.beginPath();
            const lx1 = w * (0.15 - 0.1 * ((ly - dockY) / (h - dockY))) + w * 0.05;
            const lx2 = w * (0.85 + 0.1 * ((ly - dockY) / (h - dockY))) - w * 0.05;
            ctx.moveTo(lx1, ly);
            ctx.lineTo(lx2, ly);
            ctx.stroke();
        }
        // 手すり
        ctx.strokeStyle = '#6d4c41';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(w * 0.18, dockY - 5);
        ctx.lineTo(w * 0.82, dockY - 5);
        ctx.stroke();
        ctx.restore();
    }

    /* ---- 釣り竿と糸（立体的な一人称視点） ---- */
    drawRod(rodTipX, rodTipY, hookX, hookY, tension, rodColor) {
        const { ctx, w, h } = this;
        const waterY = h * this.waterLevel;
        const rc = rodColor || '#8d6e63';

        // === 竿の基点（画面右下から伸びる） ===
        const baseX = w * 0.75;
        const baseY = h + 20;
        
        // 先端
        const tipX = rodTipX;
        const tipY = rodTipY + tension * 10;

        // テンションによる曲がり
        const bend = tension * 50;

        // 曲線上の点を計算する関数
        const getRodPoint = (t) => {
            const straightX = baseX + (tipX - baseX) * t;
            const straightY = baseY + (tipY - baseY) * t;
            const sag = Math.sin(t * Math.PI) * bend;
            return { x: straightX, y: straightY + sag };
        };

        const ptGrip = getRodPoint(0.25);
        const ptMid = getRodPoint(0.65);
        const ptTip = getRodPoint(1.0);

        ctx.save();
        ctx.lineCap = 'round';

        // --- 竿の影（水面に映る） ---
        if (tipY < waterY + 30) {
            ctx.save();
            ctx.globalAlpha = 0.08;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(baseX, waterY + 5);
            ctx.quadraticCurveTo(ptMid.x, waterY + 8, tipX, waterY + 3);
            ctx.stroke();
            ctx.restore();
        }

        // --- グリップ（コルク風、太い） ---
        const gripGrad = ctx.createLinearGradient(baseX, baseY, ptGrip.x, ptGrip.y);
        gripGrad.addColorStop(0, '#d7ccc8');
        gripGrad.addColorStop(0.5, '#bcaaa4');
        gripGrad.addColorStop(1, '#8d6e63');
        ctx.strokeStyle = gripGrad;
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(ptGrip.x, ptGrip.y);
        ctx.stroke();

        // グリップ模様（横線）
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 14;
        ctx.setLineDash([2, 6]);
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(ptGrip.x, ptGrip.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // --- リール（立体的） ---
        const reelX = baseX + (ptGrip.x - baseX) * 0.6;
        const reelY = baseY + (ptGrip.y - baseY) * 0.6 + 5;
        // リール本体（楕円）
        ctx.fillStyle = '#455a64';
        ctx.beginPath();
        ctx.ellipse(reelX, reelY, 12, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // リールハイライト
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.ellipse(reelX - 3, reelY - 3, 6, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // リールハンドル
        ctx.strokeStyle = '#78909c';
        ctx.lineWidth = 2;
        const handleAngle = this.time * 3;
        ctx.beginPath();
        ctx.moveTo(reelX, reelY);
        ctx.lineTo(reelX + Math.cos(handleAngle) * 10, reelY + Math.sin(handleAngle) * 5);
        ctx.stroke();
        ctx.fillStyle = '#90a4ae';
        ctx.beginPath();
        ctx.arc(reelX + Math.cos(handleAngle) * 10, reelY + Math.sin(handleAngle) * 5, 3, 0, Math.PI * 2);
        ctx.fill();

        // --- ロッド本体（段階的に細く、立体シェーディング） ---
        // セグメント1（太い部分）
        const seg1Grad = ctx.createLinearGradient(ptGrip.x, ptGrip.y, ptMid.x, ptMid.y);
        seg1Grad.addColorStop(0, rc);
        seg1Grad.addColorStop(0.5, this._lightenColor(rc, 30));
        seg1Grad.addColorStop(1, rc);
        ctx.strokeStyle = seg1Grad;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(ptGrip.x, ptGrip.y);
        ctx.quadraticCurveTo(
            getRodPoint(0.45).x, getRodPoint(0.45).y,
            ptMid.x, ptMid.y
        );
        ctx.stroke();

        // セグメント2（中間〜先端）
        ctx.strokeStyle = this._lightenColor(rc, 15);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ptMid.x, ptMid.y);
        ctx.quadraticCurveTo(
            getRodPoint(0.85).x, getRodPoint(0.85).y,
            ptTip.x, ptTip.y
        );
        ctx.stroke();

        // --- ガイドリング --- 
        const segments = [0.45, 0.65, 0.85];
        segments.forEach(t => {
            const pt = getRodPoint(t);
            ctx.strokeStyle = '#b0bec5';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            ctx.stroke();
        });

        // === 釣り糸（カテナリー曲線） ===
        ctx.strokeStyle = 'rgba(230, 245, 255, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        const steps = 20;
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const lx = tipX + (hookX - tipX) * t;
            // カテナリー（たるみ）の計算
            const sag = (1 - tension * 0.8) * 30 * Math.sin(t * Math.PI);
            const ly = tipY + (hookY - tipY) * t + sag;
            ctx.lineTo(lx, ly);
        }
        ctx.stroke();

        // === 浮き（3Dシェーディング） ===
        if (hookY > waterY) {
            const bobX = hookX;
            const bobY = waterY;
            const bobR = 7;
            // 水面での波紋
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(bobX, bobY + 2, bobR * 2.5, bobR * 0.5, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            // 浮きの下半分（白）
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(bobX, bobY + 1, bobR, bobR * 0.55, 0, 0, Math.PI);
            ctx.fill();
            // 浮きの上半分（赤、立体グラデーション）
            const bobGrad = ctx.createRadialGradient(bobX - 2, bobY - 2, 1, bobX, bobY, bobR);
            bobGrad.addColorStop(0, '#ff5252');
            bobGrad.addColorStop(0.7, '#d32f2f');
            bobGrad.addColorStop(1, '#b71c1c');
            ctx.fillStyle = bobGrad;
            ctx.beginPath();
            ctx.ellipse(bobX, bobY - 1, bobR, bobR * 0.55, 0, Math.PI, Math.PI * 2);
            ctx.fill();
            // ハイライト
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.ellipse(bobX - 2, bobY - 3, 3, 2, -0.3, 0, Math.PI * 2);
            ctx.fill();
            // 浮きの棒
            ctx.strokeStyle = '#5d4037';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bobX, bobY - bobR * 0.5);
            ctx.lineTo(bobX, bobY - bobR * 1.8);
            ctx.stroke();
        }

        // === ルアー/フック（水中） ===
        ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(hookX, hookY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // フック
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(hookX + 1, hookY + 5, 4, Math.PI * 0.7, Math.PI * 2.3);
        ctx.stroke();
        // 返し
        ctx.beginPath();
        ctx.moveTo(hookX + 5, hookY + 4);
        ctx.lineTo(hookX + 3, hookY + 2);
        ctx.stroke();

        ctx.restore();
    }

    /* ---- 色を明るくするヘルパー ---- */
    _lightenColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, (num >> 16) + amount);
        const g = Math.min(255, ((num >> 8) & 0xff) + amount);
        const b = Math.min(255, (num & 0xff) + amount);
        return `rgb(${r},${g},${b})`;
    }

    /* ---- テキスト描画 ---- */
    drawText(text, x, y, size, color, align) {
        const { ctx } = this;
        ctx.save();
        ctx.font = `bold ${size}px 'Zen Maru Gothic', sans-serif`;
        ctx.textAlign = align || 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color || '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
}
