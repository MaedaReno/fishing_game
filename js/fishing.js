/* ============================================
   さかな超大戦 - 釣りシステム
   キャスティング → ヒット → ファイト の3段階
   ============================================ */

class FishingSystem {
    constructor() {
        // 状態: idle, casting, waiting, hit, fighting, caught, escaped
        this.state = 'idle';
        this.spot = null;
        this.activeFishEntities = []; // 泳いでいる魚影
        this.hookX = 0;
        this.hookY = 0;
        this.hookTargetX = 0;
        this.hookTargetY = 0;
        this.hookLanded = false;

        // キャスト
        this.castPower = 0;
        this.castCharging = false;
        this.castAngle = -Math.PI * 0.3;
        this.rodTipX = 0;
        this.rodTipY = 0;

        // 待機
        this.waitTimer = 0;
        this.biteChance = 0;

        // ヒット判定
        this.hitWindow = 0;
        this.hitTarget = null;
        this.hitSuccess = false;

        // ファイト
        this.fightFish = null;
        this.fightGauge = 0;
        this.fightZonePos = 50;
        this.fightZoneDir = 1;
        this.fightCursorPos = 50;
        this.fightZoneWidth = 20;
        this.fightActive = false;

        // 入力
        this.mouseX = 0;
        this.mouseY = 0;
        this.keysDown = {};
    }

    /* ---- 釣り場に入る ---- */
    enterSpot(spot) {
        this.spot = spot;
        this.state = 'idle';
        this.activeFishEntities = [];
        this.fightActive = false;
        this._spawnFishEntities();
        this._setupInput();
        this.rodTipX = renderer.w * 0.4;
        this.rodTipY = renderer.h * renderer.waterLevel - 10;
    }

    /* ---- 釣り場を離れる ---- */
    leave() {
        this.state = 'idle';
        this.activeFishEntities = [];
        this.fightActive = false;
        this._cleanupInput();
    }

    /* =========== 魚影の生成 =========== */
    _spawnFishEntities() {
        const waterY = renderer.h * renderer.waterLevel;
        const waterH = renderer.h - waterY;
        const spotFish = this.spot.fishIds.map(id => FISH_DATABASE.find(f => f.id === id)).filter(Boolean);

        for (let i = 0; i < 8; i++) {
            const fish = spotFish[Math.floor(Math.random() * spotFish.length)];
            const depth = waterY + 60 + Math.random() * (waterH - 120);
            const facingLeft = Math.random() > 0.5;
            this.activeFishEntities.push({
                fish,
                x: Math.random() * renderer.w,
                y: depth,
                baseY: depth,
                speed: (0.3 + Math.random() * 0.8) * (fish.spd / 20),
                facingLeft,
                wobblePhase: Math.random() * Math.PI * 2,
                scale: 0.8 + Math.random() * 0.4,
                interested: false, // ルアーに興味を持っているか
                approachTimer: 0,
            });
        }
    }

    _respawnOneFish() {
        if (!this.spot) return;
        const waterY = renderer.h * renderer.waterLevel;
        const waterH = renderer.h - waterY;
        const spotFish = this.spot.fishIds.map(id => FISH_DATABASE.find(f => f.id === id)).filter(Boolean);
        const fish = spotFish[Math.floor(Math.random() * spotFish.length)];
        const facingLeft = Math.random() > 0.5;
        const depth = waterY + 60 + Math.random() * (waterH - 120);
        this.activeFishEntities.push({
            fish,
            x: facingLeft ? renderer.w + 50 : -50,
            y: depth,
            baseY: depth,
            speed: (0.3 + Math.random() * 0.8) * (fish.spd / 20),
            facingLeft,
            wobblePhase: Math.random() * Math.PI * 2,
            scale: 0.8 + Math.random() * 0.4,
            interested: false,
            approachTimer: 0,
        });
    }

    /* =========== 入力管理 =========== */
    _setupInput() {
        this._onMouseMove = (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        };
        this._onMouseDown = (e) => this._handleMouseDown(e);
        this._onMouseUp = (e) => this._handleMouseUp(e);
        this._onKeyDown = (e) => { this.keysDown[e.key] = true; this._handleKeyDown(e); };
        this._onKeyUp = (e) => { this.keysDown[e.key] = false; };

        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mousedown', this._onMouseDown);
        window.addEventListener('mouseup', this._onMouseUp);
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    _cleanupInput() {
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mousedown', this._onMouseDown);
        window.removeEventListener('mouseup', this._onMouseUp);
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }

    _handleMouseDown(e) {
        if (this.state === 'idle') {
            this.castCharging = true;
            this.castPower = 0;
            this.state = 'casting';
        } else if (this.state === 'hit') {
            this._onHitAttempt();
        }
    }

    _handleMouseUp(e) {
        if (this.state === 'casting' && this.castCharging) {
            this.castCharging = false;
            this._releaseCast();
        }
    }

    _handleKeyDown(e) {
        if (e.key === ' ' || e.key === 'Enter') {
            if (this.state === 'idle') {
                this.castCharging = true;
                this.castPower = 0;
                this.state = 'casting';
            } else if (this.state === 'hit') {
                this._onHitAttempt();
            }
        }
    }

    /* =========== キャスト =========== */
    _releaseCast() {
        const waterY = renderer.h * renderer.waterLevel;
        const power = Math.min(this.castPower, 100);
        // 手前から奥へキャスト（画面中央付近に着水）
        const castRatio = power / 100;
        this.hookTargetX = renderer.w * 0.3 + (Math.random() - 0.5) * renderer.w * 0.3;
        this.hookTargetY = waterY + 30 + castRatio * (renderer.h * 0.35);
        this.hookX = renderer.w * 0.5;
        this.hookY = renderer.h * 0.75;
        this.hookLanded = false;
        this.state = 'waiting';
        this.waitTimer = 0;

        document.getElementById('fishing-instruction').textContent = 'ルアーが着水...';

        // スプラッシュ予約
        setTimeout(() => {
            renderer.addSplash(this.hookTargetX, waterY, 15);
            renderer.addRipple(this.hookTargetX, waterY);
        }, 400);
    }

    /* =========== メインアップデート =========== */
    update(dt) {
        this._updateFishEntities(dt);

        switch (this.state) {
            case 'casting':
                this._updateCasting(dt);
                break;
            case 'waiting':
                this._updateWaiting(dt);
                break;
            case 'hit':
                this._updateHit(dt);
                break;
            case 'fighting':
                this._updateFighting(dt);
                break;
        }
    }

    /* ---- キャスト中 ---- */
    _updateCasting(dt) {
        if (this.castCharging) {
            this.castPower = Math.min(this.castPower + dt * 80, 100);
        }
    }

    /* ---- 待機中 ---- */
    _updateWaiting(dt) {
        // フックをターゲットに移動
        if (!this.hookLanded) {
            const dx = this.hookTargetX - this.hookX;
            const dy = this.hookTargetY - this.hookY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5) {
                this.hookLanded = true;
                this.hookX = this.hookTargetX;
                this.hookY = this.hookTargetY;
            } else {
                this.hookX += dx * 0.08;
                this.hookY += dy * 0.08;
            }
            return;
        }

        // ルアーの揺れ
        this.hookX = this.hookTargetX + Math.sin(renderer.time * 2) * 3;
        this.hookY = this.hookTargetY + Math.sin(renderer.time * 1.5) * 5;

        this.waitTimer += dt;

        // 魚がルアーに近づくか判定
        for (const entity of this.activeFishEntities) {
            const dx = entity.x - this.hookX;
            const dy = entity.y - this.hookY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120 && !entity.interested) {
                entity.interested = true;
                entity.approachTimer = 0;
            }

            if (entity.interested) {
                entity.approachTimer += dt;
                // ルアーに近づく
                entity.x += (this.hookX - entity.x) * 0.01;
                entity.y += (this.hookY - entity.y) * 0.005;
                entity.facingLeft = entity.x > this.hookX;

                // 十分近づいたらヒット判定開始
                if (dist < 30 && entity.approachTimer > 1.0) {
                    this._triggerHit(entity);
                    return;
                }
            }
        }

        // 長時間待っても釣れないとき自動で魚を近づける
        if (this.waitTimer > 8) {
            const closest = this.activeFishEntities.reduce((best, e) => {
                const d = Math.hypot(e.x - this.hookX, e.y - this.hookY);
                return (!best || d < best.dist) ? { entity: e, dist: d } : best;
            }, null);
            if (closest) {
                closest.entity.interested = true;
            }
        }
    }

    /* ---- ヒット発生 ---- */
    _triggerHit(entity) {
        this.state = 'hit';
        this.hitTarget = entity;
        this.hitWindow = 2.0; // 2秒間の猶予
        this.hitSuccess = false;

        document.getElementById('fishing-instruction').textContent = '🔥 HIT! クリックまたはSpaceキー！';
        document.getElementById('fishing-instruction').style.color = '#ff6b35';
        document.getElementById('fishing-instruction').style.fontSize = '2rem';

        renderer.addSplash(this.hookX, renderer.h * renderer.waterLevel, 10);
    }

    _updateHit(dt) {
        this.hitWindow -= dt;
        // ヒットウィンドウの演出（点滅）
        const flash = Math.sin(renderer.time * 15) > 0;
        document.getElementById('fishing-instruction').style.opacity = flash ? '1' : '0.6';

        if (this.hitWindow <= 0) {
            // ヒット失敗 → 魚が逃げる
            this._fishEscaped('タイミングを逃した...');
        }
    }

    _onHitAttempt() {
        if (this.state !== 'hit' || !this.hitTarget) return;
        this.hitSuccess = true;
        this._startFight(this.hitTarget);
    }

    /* =========== ファイト =========== */
    _startFight(entity) {
        this.state = 'fighting';
        this.fightFish = entity.fish;
        this.fightGauge = 0;
        this.fightZonePos = 50;
        this.fightZoneDir = 1;
        this.fightCursorPos = 50;
        this.fightActive = true;

        // 難易度に応じた設定（低レアは広いゾーン＆遅い、高レアは狭い＆速い）
        const diff = this.fightFish.difficulty;
        this.fightZoneWidth = Math.max(10, 40 - diff * 6);

        // UI更新
        document.getElementById('fight-ui').classList.remove('hidden');
        document.getElementById('fight-fish-name').textContent = this.fightFish.name;
        const rarityBadge = document.getElementById('fight-rarity');
        rarityBadge.textContent = this.fightFish.rarity;
        rarityBadge.className = `rarity-badge rarity-${this.fightFish.rarity}`;
        document.getElementById('fishing-instruction').textContent = '';
        document.getElementById('fishing-instruction').style.color = '';
        document.getElementById('fishing-instruction').style.fontSize = '';
        document.getElementById('fishing-instruction').style.opacity = '';
    }

    _updateFighting(dt) {
        if (!this.fightActive) return;

        const diff = this.fightFish.difficulty;

        // ゾーンの移動速度（低レアは非常に遅い、高レアは速い）
        const speed = (0.5 + diff * 1.2) * 40;
        this.fightZonePos += this.fightZoneDir * speed * dt;

        // ランダムな方向転換（低レアはほぼ方向転換しない）
        if (Math.random() < 0.005 * diff * diff) {
            this.fightZoneDir *= -1;
        }
        if (this.fightZonePos > 95 - this.fightZoneWidth / 2) {
            this.fightZoneDir = -1;
        }
        if (this.fightZonePos < 5 + this.fightZoneWidth / 2) {
            this.fightZoneDir = 1;
        }

        // カーソル操作
        if (this.keysDown['ArrowLeft'] || this.keysDown['a']) {
            this.fightCursorPos = Math.max(2, this.fightCursorPos - 150 * dt);
        }
        if (this.keysDown['ArrowRight'] || this.keysDown['d']) {
            this.fightCursorPos = Math.min(98, this.fightCursorPos + 150 * dt);
        }
        // マウスでも操作可能
        const barArea = document.querySelector('.fight-bar-area');
        if (barArea) {
            const rect = barArea.getBoundingClientRect();
            if (this.mouseX >= rect.left && this.mouseX <= rect.right) {
                this.fightCursorPos = ((this.mouseX - rect.left) / rect.width) * 100;
            }
        }

        // ゲージ判定（低レアは爆速で溜まり、ほぼ減らない）
        const zoneLeft = this.fightZonePos - this.fightZoneWidth / 2;
        const zoneRight = this.fightZonePos + this.fightZoneWidth / 2;
        const inZone = this.fightCursorPos >= zoneLeft && this.fightCursorPos <= zoneRight;

        const fillRate = 60 / (diff * diff + 0.5);  // C: ~86, SSR: ~2.4
        const drainRate = 5 * diff * diff;            // C: ~2.5, SSR: ~125

        if (inZone) {
            this.fightGauge = Math.min(100, this.fightGauge + fillRate * dt);
        } else {
            this.fightGauge = Math.max(0, this.fightGauge - drainRate * dt);
        }

        // UI更新
        document.getElementById('fight-gauge-fill').style.width = this.fightGauge + '%';
        const zoneEl = document.getElementById('fight-zone');
        zoneEl.style.left = zoneLeft + '%';
        zoneEl.style.width = this.fightZoneWidth + '%';
        document.getElementById('fight-cursor').style.left = this.fightCursorPos + '%';

        // ゲージが変わるときの色変化
        const fillEl = document.getElementById('fight-gauge-fill');
        if (this.fightGauge > 80) {
            fillEl.style.background = 'linear-gradient(90deg, #64ffda, #69f0ae, #ffd700)';
        } else if (this.fightGauge > 50) {
            fillEl.style.background = 'linear-gradient(90deg, #00e5ff, #64ffda, #69f0ae)';
        } else {
            fillEl.style.background = '';
        }

        // 成功 or 失敗
        if (this.fightGauge >= 100) {
            this._fishCaught();
        }
    }

    /* =========== 釣果 =========== */
    _fishCaught() {
        this.fightActive = false;
        this.state = 'caught';
        document.getElementById('fight-ui').classList.add('hidden');

        const fish = this.fightFish;
        const weight = (fish.weight.min + Math.random() * (fish.weight.max - fish.weight.min)).toFixed(2);

        // 魚影を1匹除去
        const idx = this.activeFishEntities.indexOf(this.hitTarget);
        if (idx !== -1) this.activeFishEntities.splice(idx, 1);

        // 釣果画面を表示
        game.showResult(fish, weight);
    }

    _fishEscaped(msg) {
        this.state = 'idle';
        this.fightActive = false;
        this.hitTarget = null;
        document.getElementById('fight-ui').classList.add('hidden');
        document.getElementById('fishing-instruction').textContent = msg || '魚に逃げられた...';
        document.getElementById('fishing-instruction').style.color = '';
        document.getElementById('fishing-instruction').style.fontSize = '';
        document.getElementById('fishing-instruction').style.opacity = '';

        setTimeout(() => {
            if (this.state === 'idle') {
                document.getElementById('fishing-instruction').textContent = 'クリックでキャスト！';
                this._respawnOneFish();
            }
        }, 2000);
    }

    /* =========== 魚影のアニメーション更新 =========== */
    _updateFishEntities(dt) {
        for (const e of this.activeFishEntities) {
            if (e.interested && this.state === 'waiting') continue; // 興味持ちは別処理

            // 通常遊泳
            if (e.facingLeft) {
                e.x -= e.speed;
            } else {
                e.x += e.speed;
            }

            // 上下の揺れ
            e.wobblePhase += 0.02;
            e.y = e.baseY + Math.sin(e.wobblePhase) * 8;

            // 画面外で折り返し
            if (e.x < -100) { e.x = renderer.w + 50; e.facingLeft = true; }
            if (e.x > renderer.w + 100) { e.x = -50; e.facingLeft = false; }
        }
    }

    /* =========== 描画 =========== */
    render() {
        // 魚影の描画
        for (const e of this.activeFishEntities) {
            renderer.drawFish(e.fish, e.x, e.y, e.scale, true, e.facingLeft);
        }

        // 釣り竿とフック
        if (this.state === 'casting') {
            // パワーゲージ表示
            const barW = 200;
            const barH = 12;
            const barX = renderer.w / 2 - barW / 2;
            const barY = renderer.h * 0.85;
            const ctx = renderer.ctx;
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(barX, barY, barW, barH);
            const pct = this.castPower / 100;
            const grd = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            grd.addColorStop(0, '#64ffda');
            grd.addColorStop(0.7, '#ffd700');
            grd.addColorStop(1, '#ff5252');
            ctx.fillStyle = grd;
            ctx.fillRect(barX, barY, barW * pct, barH);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.strokeRect(barX, barY, barW, barH);
            ctx.restore();
            renderer.drawText('パワー', renderer.w / 2, barY - 14, 14, '#fff');
        }

        if (this.state === 'waiting' || this.state === 'hit' || this.state === 'fighting') {
            const tension = this.state === 'fighting' ? 0.5 + Math.sin(renderer.time * 5) * 0.3 : 0;
            renderer.drawRod(this.rodTipX, this.rodTipY, this.hookX, this.hookY, tension);
        }

        // ファイト中は対象の魚を実体で描画
        if (this.state === 'fighting' && this.hitTarget) {
            const e = this.hitTarget;
            const shakeX = Math.sin(renderer.time * 12) * 4;
            const shakeY = Math.cos(renderer.time * 8) * 3;
            renderer.drawFish(e.fish, e.x + shakeX, e.y + shakeY, e.scale * 1.2, false, e.facingLeft);
        }

        // ヒット時のエフェクト
        if (this.state === 'hit') {
            const alpha = Math.sin(renderer.time * 10) * 0.5 + 0.5;
            renderer.drawText('⚡ HIT! ⚡', this.hookX, this.hookY - 40, 28, `rgba(255, 107, 53, ${alpha})`);
        }
    }
}
