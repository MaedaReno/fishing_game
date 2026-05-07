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
        this.timeStopRemaining = 0;

        // ファイト
        this.fightFish = null;
        this.fightCapture = 0;
        this.fightZonePos = 50;
        this.fightZoneDir = 1;
        this.fightCursorPos = 50;
        this.fightZoneWidth = 20;
        this.fightActive = false;
        this.fightEscapeTimer = 0;
        this.fightFishTimer = 0;
        this.fightFishMoveTime = 1.0;

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
        this.rodTipX = renderer.w * 0.85;
        this.rodTipY = renderer.h * 0.25;
        this.rebuildActiveSkillsUI();
    }

    /* ---- 釣り場を離れる ---- */
    leave() {
        this.state = 'idle';
        this.activeFishEntities = [];
        this.fightActive = false;
        this._cleanupInput();
    }

    /* =========== 魚影の生成 =========== */
    _getWeightedRandomFish(spotFish) {
        let nextSpot = FISHING_SPOTS.find(s => !s.unlocked);
        let targetUnlockFishId = nextSpot && nextSpot.unlockReq ? nextSpot.unlockReq.fishId : null;

        let totalWeight = 0;
        spotFish.forEach(f => {
            let w = f.spawnWeight || 1;
            if (f.id === targetUnlockFishId) w *= 3.0;
            totalWeight += w;
        });

        let r = Math.random() * totalWeight;
        for (const f of spotFish) {
            let w = f.spawnWeight || 1;
            if (f.id === targetUnlockFishId) w *= 3.0;
            r -= w;
            if (r <= 0) return f;
        }
        return spotFish[0];
    }

    _spawnFishEntities() {
        const waterY = renderer.h * renderer.waterLevel;
        const waterH = renderer.h - waterY;
        const spotFish = this.spot.fishIds.map(id => FISH_DATABASE.find(f => f.id === id)).filter(Boolean);

        for (let i = 0; i < 8; i++) {
            const fish = this._getWeightedRandomFish(spotFish);
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
                interested: false,
                approachTimer: 0,
            });
        }
    }

    _respawnOneFish() {
        if (!this.spot) return;
        const waterY = renderer.h * renderer.waterLevel;
        const waterH = renderer.h - waterY;
        const spotFish = this.spot.fishIds.map(id => FISH_DATABASE.find(f => f.id === id)).filter(Boolean);
        const fish = this._getWeightedRandomFish(spotFish);
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

    /* =========== アクティブスキル =========== */
    rebuildActiveSkillsUI() {
        const container = document.getElementById('active-skills-container');
        if (!container) return;
        
        const activeSkills = game.learnedSkills.filter(s => s.type === 'active');
        if (activeSkills.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        container.innerHTML = '';
        
        if (!game.activeSkillCooldowns) game.activeSkillCooldowns = {};

        activeSkills.forEach((skill, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-active-skill';
            btn.id = `btn-skill-${skill.id}`;
            
            const keyNum = index + 1;
            btn.innerHTML = `
                <div class="skill-icon">${skill.icon || '✨'}</div>
                <div class="skill-key">${keyNum}</div>
                <div class="skill-cooldown-overlay" id="cd-${skill.id}"></div>
            `;
            
            btn.addEventListener('click', () => this.useActiveSkill(skill));
            container.appendChild(btn);
        });
    }

    useActiveSkill(skill) {
        if (this.state !== 'fighting') return;
        
        const now = performance.now();
        const lastUsed = game.activeSkillCooldowns[skill.id] || 0;
        if (now - lastUsed < skill.cooldown * 1000) return;

        game.activeSkillCooldowns[skill.id] = now;
        
        if (skill.id === 'hookmaster') {
            this.fightCapture += 30;
            if (this.fightCapture > 100) this.fightCapture = 100;
            this._showSkillEffect('⚡ フッキングマスター！ (ゲージ+30%)');
        } else if (skill.id === 'timestop') {
            this.timeStopRemaining = 3.0;
            this._showSkillEffect('⏳ 時間停止！ (3秒間)');
        } else if (skill.id === 'god_hand') {
            this.fightCapture += 50;
            if (this.fightCapture > 100) this.fightCapture = 100;
            this._showSkillEffect('✋ ゴッドハンド！ (ゲージ+50%)');
        }
    }

    _showSkillEffect(text) {
        const popup = document.createElement('div');
        popup.className = 'skill-popup-text';
        popup.textContent = text;
        popup.style.position = 'absolute';
        popup.style.top = '30%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.color = '#fff';
        popup.style.textShadow = '0 0 10px #ffea00';
        popup.style.fontSize = '2rem';
        popup.style.fontWeight = 'bold';
        popup.style.pointerEvents = 'none';
        popup.style.zIndex = '1000';
        popup.style.animation = 'skillPopup 1.5s ease-out forwards';
        document.getElementById('screen-fishing').appendChild(popup);
        setTimeout(() => popup.remove(), 1500);
    }

    _handleMouseDown(e) {
        if (this.state === 'idle') {
            this.castCharging = true;
            this.castPower = 0;
            this.state = 'casting';
        } else if (this.state === 'hit') {
            this._onHitAttempt();
        } else if (this.state === 'waiting') {
            this._reelIn();
        }
    }

    _handleMouseUp(e) {
        if (this.state === 'casting' && this.castCharging) {
            this.castCharging = false;
            this._releaseCast();
        }
    }

    _handleKeyDown(e) {
        if (e.code === 'Space') {
            this._handleMouseDown();
        }
        
        const activeSkills = game.learnedSkills.filter(s => s.type === 'active');
        const keyNum = parseInt(e.key);
        if (!isNaN(keyNum) && keyNum > 0 && keyNum <= activeSkills.length) {
            this.useActiveSkill(activeSkills[keyNum - 1]);
        }
    }

    _reelIn() {
        this.state = 'idle';
        this.hitTarget = null;
        for (const e of this.activeFishEntities) {
            e.interested = false;
        }
        document.getElementById('fishing-instruction').textContent = 'クリックまたはSpaceキーでキャスト！';
        renderer.targetZoom = 1.0;
        renderer.targetPanY = 0.0;
    }

    /* =========== キャスト =========== */
    _releaseCast() {
        const waterY = renderer.h * renderer.waterLevel;
        const power = Math.min(this.castPower, 100);
        
        const castRatio = power / 100;
        this.hookTargetX = renderer.w * 0.5;
        this.hookTargetY = waterY + 40 + (1 - castRatio) * (renderer.h * 0.35);
        this.hookX = renderer.w * 0.5;
        this.hookY = renderer.h * 0.8;
        this.hookLanded = false;
        this.state = 'waiting';
        this.waitTimer = 0;

        document.getElementById('fishing-instruction').textContent = 'ルアーが着水...';

        setTimeout(() => {
            renderer.addSplash(this.hookTargetX, waterY, 15);
            renderer.addRipple(this.hookTargetX, waterY);
        }, 400);
    }

    /* =========== メインアップデート =========== */
    update(dt) {
        this._updateFishEntities(dt);

        switch (this.state) {
            case 'idle':
            case 'caught':
                renderer.targetZoom = 1.0;
                renderer.targetPanY = 0.0;
                break;
            case 'casting':
                renderer.targetZoom = 1.0;
                renderer.targetPanY = 0.0;
                this._updateCasting(dt);
                break;
            case 'waiting':
            case 'hit':
            case 'fighting':
                renderer.targetZoom = 1.0 + (this.castPower / 100) * 1.5;
                const waterY = renderer.h * renderer.waterLevel;
                const zoomedY = waterY + (this.hookTargetY - waterY) * renderer.targetZoom;
                renderer.targetPanY = renderer.h * 0.5 - zoomedY;
                
                if (this.state === 'waiting') this._updateWaiting(dt);
                if (this.state === 'hit') this._updateHit(dt);
                if (this.state === 'fighting') this._updateFighting(dt);
                break;
        }

        // アクティブスキルのクールダウンUI更新
        if (game.learnedSkills && game.activeSkillCooldowns) {
            const now = performance.now();
            game.learnedSkills.filter(s => s.type === 'active').forEach(skill => {
                const overlay = document.getElementById(`cd-${skill.id}`);
                if (overlay) {
                    const lastUsed = game.activeSkillCooldowns[skill.id] || 0;
                    const elapsed = (now - lastUsed) / 1000;
                    if (elapsed < skill.cooldown) {
                        const percent = ((skill.cooldown - elapsed) / skill.cooldown) * 100;
                        overlay.style.height = `${percent}%`;
                    } else {
                        overlay.style.height = `0%`;
                    }
                }
            });
        }
    }

    _updateCasting(dt) {
        if (this.castCharging) {
            this.castPower = Math.min(this.castPower + dt * 80, 100);
        }
    }

    _updateWaiting(dt) {
        if (!this.hookLanded) {
            const dx = this.hookTargetX - this.hookX;
            const dy = this.hookTargetY - this.hookY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 15) {
                this.hookLanded = true;
                this.hookX = this.hookTargetX;
                this.hookY = this.hookTargetY;
                renderer.addSplash(this.hookX, renderer.h * renderer.waterLevel, 5);
            } else {
                this.hookX += dx * 0.15;
                this.hookY += dy * 0.15;
            }
            return;
        }

        this.hookX = this.hookTargetX + Math.sin(renderer.time * 2) * 3;
        this.hookY = this.hookTargetY + Math.sin(renderer.time * 1.5) * 5;

        this.waitTimer += dt;

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
                entity.x += (this.hookX - entity.x) * 0.03;
                entity.y += (this.hookY - entity.y) * 0.02;
                entity.facingLeft = entity.x > this.hookX;

                if (dist < 30 && entity.approachTimer > 1.0) {
                    this._triggerHit(entity);
                    return;
                }
            }
        }

        if (this.waitTimer > 8) {
            const closest = this.activeFishEntities.reduce((best, e) => {
                const d = Math.hypot(e.x - this.hookX, e.y - this.hookY);
                return (!best || d < best.dist) ? { entity: e, dist: d } : best;
            }, null);
            if (closest) closest.entity.interested = true;
        }
    }

    _triggerHit(entity) {
        this.state = 'hit';
        this.hitTarget = entity;
        this.hitWindow = 2.0;
        this.hitSuccess = false;

        document.getElementById('fishing-instruction').textContent = '🔥 HIT! クリックまたはSpaceキー！';
        document.getElementById('fishing-instruction').style.color = '#ff6b35';
        document.getElementById('fishing-instruction').style.fontSize = '2rem';

        renderer.addSplash(this.hookX, renderer.h * renderer.waterLevel, 10);
    }

    _updateHit(dt) {
        this.hitWindow -= dt;
        const flash = Math.sin(renderer.time * 15) > 0;
        document.getElementById('fishing-instruction').style.opacity = flash ? '1' : '0.6';

        if (this.hitWindow <= 0) {
            this._fishEscaped('タイミングを逃した...');
        }
    }

    _onHitAttempt() {
        if (this.state !== 'hit' || !this.hitTarget) return;
        this.hitSuccess = true;
        this._startFight(this.hitTarget);
    }

    _startFight(entity) {
        this.state = 'fighting';
        this.fightFish = entity.fish;
        this.fightCapture = 0;
        this.fightZonePos = 50;
        this.fightZoneDir = 1;
        this.fightCursorPos = 50;
        this.fightActive = true;
        this.timeStopRemaining = 0;
        this.fightEscapeTimer = 0;
        this.fightFishTimer = 0;

        const rod = game.equippedRod || RODS[0];
        const diff = this.fightFish.difficulty * rod.diffMod;
        const skills = game.learnedSkills || [];
        this.fightZoneWidth = Math.max(10, (40 - diff * 6) * (skills.find(s => s.id === 'wideview') ? 1.2 : 1));

        document.getElementById('fight-ui').classList.remove('hidden');
        document.getElementById('fishing-instruction').textContent = '';
    }

    _updateGaugeAndEscape(dt, isInside) {
        const fish = this.hitTarget.fish;
        let drainMod = 1.0;
        let fillMod = 1.0;
        game.learnedSkills.forEach(s => {
            if (s.effect && s.effect.drainMod) drainMod *= s.effect.drainMod;
            if (s.effect && s.effect.fillMod) fillMod *= s.effect.fillMod;
        });

        if (isInside || this.timeStopRemaining > 0) {
            this.fightCapture += 20 * fillMod * dt;
            this.fightEscapeTimer = 0;
            if (this.fightCapture >= 100) {
                this.fightCapture = 100;
                this._catchFish();
            }
        } else {
            this.fightCapture -= 15 * drainMod * fish.difficulty * dt;
            if (this.fightCapture <= 0) {
                this.fightCapture = 0;
                this.fightEscapeTimer += dt;
                let escapeTimeMod = 0;
                game.learnedSkills.forEach(s => {
                    if (s.effect && s.effect.escapeTimeMod) escapeTimeMod += s.effect.escapeTimeMod;
                });
                if (this.fightEscapeTimer > 2.0 + escapeTimeMod) this._fishEscaped('魚に逃げられた！');
            }
        }
        
        document.getElementById('fight-gauge-fill').style.width = `${Math.max(0, this.fightCapture)}%`;
        const r = Math.min(255, (100 - this.fightCapture) * 5);
        const g = Math.min(255, this.fightCapture * 5);
        document.getElementById('fight-gauge-fill').style.backgroundColor = `rgb(${r}, ${g}, 0)`;
    }

    _updateFighting(dt) {
        if (this.timeStopRemaining > 0) {
            this.timeStopRemaining -= dt;
            this._updateGaugeAndEscape(dt, true);
            return;
        }

        const rod = game.equippedRod || RODS[0];
        const diff = this.fightFish.difficulty * rod.diffMod;
        const speed = (0.5 + diff * 1.2) * 40;
        this.fightZonePos += this.fightZoneDir * speed * dt;

        if (this.fightZonePos > 95 - this.fightZoneWidth / 2 || this.fightZonePos < 5 + this.fightZoneWidth / 2) {
            this.fightZoneDir *= -1;
        }

        if (this.keysDown['ArrowLeft'] || this.keysDown['a']) this.fightCursorPos = Math.max(2, this.fightCursorPos - 150 * dt);
        if (this.keysDown['ArrowRight'] || this.keysDown['d']) this.fightCursorPos = Math.min(98, this.fightCursorPos + 150 * dt);

        const barArea = document.querySelector('.fight-bar-area');
        if (barArea) {
            const rect = barArea.getBoundingClientRect();
            if (this.mouseX >= rect.left && this.mouseX <= rect.right) {
                this.fightCursorPos = ((this.mouseX - rect.left) / rect.width) * 100;
            }
        }

        const zoneLeft = this.fightZonePos - this.fightZoneWidth / 2;
        const zoneRight = this.fightZonePos + this.fightZoneWidth / 2;
        const inZone = this.fightCursorPos >= zoneLeft && this.fightCursorPos <= zoneRight;

        this._updateGaugeAndEscape(dt, inZone);

        // UI更新
        const zoneEl = document.getElementById('fight-zone');
        zoneEl.style.left = zoneLeft + '%';
        zoneEl.style.width = this.fightZoneWidth + '%';
        document.getElementById('fight-cursor').style.left = this.fightCursorPos + '%';

        // ヒント表示の更新
        const escapeTimeMod = game.learnedSkills.reduce((acc, s) => acc + (s.effect && s.effect.escapeTimeMod ? s.effect.escapeTimeMod : 0), 0);
        const limit = 2.0 + escapeTimeMod;
        const escapeRatio = this.fightEscapeTimer / limit;
        const hintEl = document.querySelector('.fight-hint');
        if (escapeRatio > 0.5) {
            hintEl.textContent = `⚠️ 魚が暴れている！ (${Math.ceil(limit - this.fightEscapeTimer)}秒)`;
            hintEl.style.color = escapeRatio > 0.8 ? '#ff5252' : '#ff9800';
        } else {
            hintEl.textContent = '← → キーまたはマウスでバーを操作';
            hintEl.style.color = '';
        }
    }

    /* =========== 釣果 =========== */
    _catchFish() {
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
        renderer.targetZoom = 1.0;

        setTimeout(() => {
            if (this.state === 'idle') {
                document.getElementById('fishing-instruction').textContent = 'クリックまたはSpaceキーでキャスト！';
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
        const ctx = renderer.ctx;
        
        // --- ズーム空間（ワールド）での描画 ---
        ctx.save();
        const waterY = renderer.h * renderer.waterLevel;
        ctx.translate(0, renderer.panY);
        ctx.translate(renderer.w / 2, waterY);
        ctx.scale(renderer.zoom, renderer.zoom);
        ctx.translate(-renderer.w / 2, -waterY);

        // 魚影の描画
        for (const e of this.activeFishEntities) {
            renderer.drawFish(e.fish, e.x, e.y, e.scale, true, e.facingLeft);
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
        
        ctx.restore();
        // --- ここまでワールド空間 ---

        // 桟橋の描画（竿を振った後は表示しない＝idle, casting, caught時のみ）
        if (this.state === 'idle' || this.state === 'casting' || this.state === 'caught') {
            renderer.drawDock();
        }

        // 釣り竿とフック（スクリーン空間）
        if (this.state === 'casting') {
            // パワーゲージ表示
            const barW = 200;
            const barH = 12;
            const barX = renderer.w / 2 - barW / 2;
            const barY = renderer.h * 0.85;
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
            const rodColor = (game.equippedRod || RODS[0]).color;
            // 座標をスクリーン空間に変換して竿を描画
            const screenHook = renderer.getScreenPos(this.hookX, this.hookY);
            renderer.drawRod(this.rodTipX, this.rodTipY, screenHook.x, screenHook.y, tension, rodColor);
        }
    }
}
