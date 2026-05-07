/* ============================================
   さかな超大戦 - ゲーム管理 (メインエントリ)
   ============================================ */

const renderer = new Renderer();
const fishing = new FishingSystem();

const game = {
    screen: 'title',
    money: 1000,
    catches: 0,
    allies: [],
    collection: {},
    inventory: {}, // 仲間にした（保持している）魚の数
    currentSpot: null,
    lastTime: 0,
    equippedRod: RODS[0],
    ownedRods: [RODS[0]],
    learnedSkills: [],

    /* ---- 初期化 ---- */
    init() {
        renderer.init();
        this._bindUI();
        this.showScreen('title');
        this.lastTime = performance.now();
        this._gameLoop();
    },

    /* ---- UI バインド ---- */
    _bindUI() {
        document.getElementById('btn-start').addEventListener('click', () => {
            this.showScreen('spot');
        });
        document.getElementById('btn-back-title').addEventListener('click', () => {
            this.showScreen('title');
        });
        document.getElementById('btn-leave-fishing').addEventListener('click', () => {
            fishing.leave();
            this.showScreen('spot');
        });
        document.getElementById('btn-back-spot').addEventListener('click', () => {
            this.showScreen('spot');
        });
        document.getElementById('btn-keep').addEventListener('click', () => {
            this._keepFish();
        });
        document.getElementById('btn-sell').addEventListener('click', () => {
            this._sellFish();
        });

        // ショップ関連
        const btnShop = document.getElementById('btn-go-shop');
        if (btnShop) btnShop.addEventListener('click', () => {
            this.showScreen('shop');
        });
        const btnBackShop = document.getElementById('btn-back-spot-from-shop');
        if (btnBackShop) btnBackShop.addEventListener('click', () => {
            this.showScreen('spot');
        });
        const tabRods = document.getElementById('tab-rods');
        const tabSkills = document.getElementById('tab-skills');
        if (tabRods) tabRods.addEventListener('click', () => {
            tabRods.classList.add('active');
            tabSkills.classList.remove('active');
            this._buildShop('rods');
        });
        if (tabSkills) tabSkills.addEventListener('click', () => {
            tabSkills.classList.add('active');
            tabRods.classList.remove('active');
            this._buildShop('skills');
        });
    },

    /* ---- 画面切り替え ---- */
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${id}`).classList.add('active');
        this.screen = id;

        if (id === 'spot') {
            const spotMoney = document.getElementById('spot-money-amount');
            if (spotMoney) spotMoney.textContent = `💰 ${this.money}`;
            this._buildSpotList();
        }
        if (id === 'collection') this._buildCollection();
        if (id === 'shop') {
            document.getElementById('shop-money-amount').textContent = `💰 ${this.money}`;
            this._buildShop(document.getElementById('tab-rods').classList.contains('active') ? 'rods' : 'skills');
        }
    },

    _buildSpotList() {
        const container = document.getElementById('spot-list');
        container.innerHTML = '';
        FISHING_SPOTS.forEach(spot => {
            const card = document.createElement('div');
            card.className = 'spot-card' + (spot.unlocked ? '' : ' locked');
            card.innerHTML = `
                <div class="spot-icon">${spot.icon}</div>
                <div class="spot-info">
                    <h3>${spot.name}</h3>
                    <p>${spot.desc}</p>
                </div>
            `;
            if (spot.unlocked) {
                card.addEventListener('click', () => this._enterSpot(spot));
            } else {
                const reqCount = spot.unlockReq ? spot.unlockReq.count : 0;
                const reqFishId = spot.unlockReq ? spot.unlockReq.fishId : null;
                const reqFish = reqFishId ? FISH_DATABASE.find(f => f.id === reqFishId) : null;
                const caughtCount = reqFishId ? (this.collection[reqFishId] || 0) : 0;
                const canUnlock = (caughtCount >= reqCount) && (this.money >= spot.unlockCost);

                let reqHtml = '';
                if (reqFish) {
                    const reqColor = caughtCount >= reqCount ? '#4ade80' : '#f87171';
                    reqHtml = `<div style="font-size: 0.85rem; margin: 4px 0; display: flex; justify-content: space-between;">
                        <span>🎯 条件: ${reqFish.emoji}${reqFish.name}</span>
                        <span style="color:${reqColor}; font-weight: bold;">${caughtCount}/${reqCount}匹</span>
                    </div>`;
                }
                const costColor = this.money >= spot.unlockCost ? '#4ade80' : '#f87171';

                card.innerHTML += `
                    <div class="spot-lock-info" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
                        <div style="font-size: 0.85rem; margin: 4px 0; display: flex; justify-content: space-between;">
                            <span>💰 費用:</span>
                            <span style="color:${costColor}; font-weight: bold;">${spot.unlockCost} コイン</span>
                        </div>
                        ${reqHtml}
                        <button class="btn-glow small btn-unlock" style="margin-top: 12px; width: 100%; padding: 8px;" ${canUnlock ? '' : 'disabled'}>🔓 解放する</button>
                    </div>
                `;

                const btn = card.querySelector('.btn-unlock');
                if (btn && canUnlock) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.money -= spot.unlockCost;
                        spot.unlocked = true;
                        this._updateHUD();
                        this._buildSpotList();
                    });
                }
            }
            container.appendChild(card);
        });
    },

    /* ---- 釣り場に入る ---- */
    _enterSpot(spot) {
        this.currentSpot = spot;
        renderer.setSpot(spot);
        fishing.enterSpot(spot);
        this.showScreen('fishing');
        document.getElementById('hud-spot-name').textContent = spot.name;
        this._updateHUD();
        document.getElementById('fishing-instruction').textContent = 'クリックまたはSpaceキーでキャスト！';
        document.getElementById('fishing-instruction').style.color = '';
        document.getElementById('fishing-instruction').style.fontSize = '';
        document.getElementById('fishing-instruction').style.opacity = '';
    },

    /* ---- HUD更新 ---- */
    _updateHUD() {
        document.getElementById('hud-catches').textContent = `🐟 ${this.catches}`;
        document.getElementById('hud-money').textContent = `💰 ${this.money}`;
        const spotMoney = document.getElementById('spot-money-amount');
        if (spotMoney) spotMoney.textContent = `💰 ${this.money}`;
        const shopMoney = document.getElementById('shop-money-amount');
        if (shopMoney) shopMoney.textContent = `💰 ${this.money}`;
    },

    /* ---- 釣果表示 ---- */
    showResult(fish, weight) {
        this.showScreen('result');
        this._pendingFish = fish;
        this._pendingWeight = weight;

        document.getElementById('result-icon').textContent = fish.emoji;
        document.getElementById('result-fish-name').textContent = fish.name;

        const badge = document.getElementById('result-rarity-badge');
        badge.textContent = fish.rarity;
        badge.className = `rarity-badge large rarity-${fish.rarity}`;

        document.getElementById('result-stats').innerHTML = `
            <div class="result-stat"><span class="label">HP</span><span class="value">${fish.hp}</span></div>
            <div class="result-stat"><span class="label">ATK</span><span class="value">${fish.atk}</span></div>
            <div class="result-stat"><span class="label">SPD</span><span class="value">${fish.spd}</span></div>
            <div class="result-stat"><span class="label">重さ</span><span class="value">${weight}kg</span></div>
            <div class="result-stat"><span class="label">売値</span><span class="value">💰${fish.value}</span></div>
        `;
    },

    _keepFish() {
        if (!this._pendingFish) return;
        const fish = this._pendingFish;
        this.allies.push({ ...fish, weight: this._pendingWeight });
        this.collection[fish.id] = (this.collection[fish.id] || 0) + 1;
        this.inventory[fish.id] = (this.inventory[fish.id] || 0) + 1;
        this.catches++;
        this._updateHUD();
        this._pendingFish = null;
        this._returnToFishing();
    },

    _sellFish() {
        if (!this._pendingFish) return;
        const fish = this._pendingFish;
        
        let sellPrice = fish.value;
        this.learnedSkills.forEach(s => {
            if (s.effect && s.effect.sellMod) sellPrice = Math.floor(sellPrice * s.effect.sellMod);
        });

        this.money += sellPrice;
        this.collection[fish.id] = (this.collection[fish.id] || 0) + 1;
        this.catches++;
        this._updateHUD();
        this._pendingFish = null;
        this._returnToFishing();
    },

    _returnToFishing() {
        if (this.currentSpot) {
            this._enterSpot(this.currentSpot);
        } else {
            this.showScreen('spot');
        }
    },

    /* ---- 図鑑 ---- */
    _buildCollection() {
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = '';
        FISH_DATABASE.forEach(fish => {
            const caughtCount = this.collection[fish.id] || 0;
            const caught = caughtCount > 0;
            const item = document.createElement('div');
            item.className = 'collection-item ' + (caught ? 'caught' : 'unknown');
            item.innerHTML = `
                <span class="fish-emoji">${caught ? fish.emoji : '❓'}</span>
                <span class="fish-label">${caught ? fish.name : '???'}</span>
                ${caught ? `<span style="font-size: 0.8rem; opacity: 0.7; margin-top: 4px;">捕獲数: ${caughtCount}</span>` : ''}
            `;
            grid.appendChild(item);
        });
    },

    /* ---- ショップ ---- */
    _buildShop(type) {
        const grid = document.getElementById('shop-list');
        grid.innerHTML = '';
        
        if (type === 'rods') {
            RODS.forEach(rod => {
                const owned = this.ownedRods ? this.ownedRods.find(r => r.id === rod.id) : (rod.cost === 0);
                const equipped = this.equippedRod && this.equippedRod.id === rod.id;
                const item = document.createElement('div');
                item.className = 'shop-item' + (owned && !equipped ? ' owned' : '');
                
                let btnHtml = '';
                if (equipped) {
                    btnHtml = `<button class="btn-secondary btn-buy" disabled>装備中</button>`;
                } else if (owned) {
                    btnHtml = `<button class="btn-glow small btn-buy">装備する</button>`;
                } else {
                    btnHtml = `<button class="btn-glow small btn-buy" ${this.money < rod.cost ? 'disabled' : ''}>購入</button>`;
                }

                item.innerHTML = `
                    <h3>${rod.name}</h3>
                    <p>${rod.desc}</p>
                    <div class="shop-item-cost">${rod.cost === 0 ? '無料' : `💰 ${rod.cost}`}</div>
                    ${btnHtml}
                `;

                const btn = item.querySelector('.btn-buy');
                if (btn && !btn.disabled) {
                    btn.addEventListener('click', () => {
                        if (owned) {
                            this.equippedRod = rod;
                        } else if (this.money >= rod.cost) {
                            this.money -= rod.cost;
                            this.ownedRods.push(rod);
                            this.equippedRod = rod;
                            document.getElementById('shop-money-amount').textContent = `💰 ${this.money}`;
                        }
                        this._buildShop('rods');
                    });
                }
                grid.appendChild(item);
            });
        } else if (type === 'skills') {
            SKILLS.forEach(skill => {
                const owned = this.learnedSkills.includes(skill);
                const isFishCost = skill.costType === 'fish';
                const reqFish = isFishCost ? FISH_DATABASE.find(f => f.id === skill.reqFishId) : null;
                const invCount = isFishCost ? (this.inventory[skill.reqFishId] || 0) : 0;
                
                const canAfford = isFishCost ? (invCount >= skill.reqCount) : (this.money >= skill.cost);

                let costHtml = '';
                if (isFishCost) {
                    const reqColor = invCount >= skill.reqCount ? '#4ade80' : '#f87171';
                    costHtml = `🐟 ${reqFish.emoji}${reqFish.name} <span style="color:${reqColor}; font-weight:bold;">${invCount}/${skill.reqCount}匹</span>`;
                } else {
                    const costColor = this.money >= skill.cost ? '#4ade80' : '#f87171';
                    costHtml = `💰 <span style="color:${costColor}; font-weight:bold;">${skill.cost}</span>`;
                }

                const typeBadge = skill.type === 'active' 
                    ? '<span class="rarity-badge rarity-S" style="font-size:0.7rem; padding: 2px 6px; vertical-align: middle; margin-left: 8px;">アクティブ</span>' 
                    : '<span class="rarity-badge rarity-C" style="font-size:0.7rem; padding: 2px 6px; vertical-align: middle; margin-left: 8px;">パッシブ</span>';

                const item = document.createElement('div');
                item.className = 'shop-item' + (owned ? ' owned' : '');
                item.innerHTML = `
                    <h3>${skill.icon ? skill.icon + ' ' : ''}${skill.name} ${typeBadge}</h3>
                    <p>${skill.desc}</p>
                    <div class="shop-item-cost" style="margin-top: 8px;">${costHtml}</div>
                    <button class="btn-glow small btn-buy" ${owned || !canAfford ? 'disabled' : ''}>${owned ? '習得済' : '購入'}</button>
                `;
                
                const btn = item.querySelector('.btn-buy');
                if (btn && !btn.disabled) {
                    btn.addEventListener('click', () => {
                        if (isFishCost) {
                            this.inventory[skill.reqFishId] -= skill.reqCount;
                        } else {
                            this.money -= skill.cost;
                        }
                        this.learnedSkills.push(skill);
                        
                        if (typeof fishing.rebuildActiveSkillsUI === 'function') {
                            fishing.rebuildActiveSkillsUI();
                        }
                        
                        this._updateHUD();
                        this._buildShop('skills');
                    });
                }
                grid.appendChild(item);
            });
        }
    },

    /* =========== ゲームループ =========== */
    _gameLoop() {
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;

        if (this.screen === 'fishing') {
            fishing.update(dt);
        }

        // Canvas描画の上に魚影と釣り竿を重ねる
        // renderer.draw() はすでにloopで呼ばれている
        // ここではCanvasの上に追加描画するため、rendererのloop後に描画
        this._renderOverlay();

        requestAnimationFrame(() => this._gameLoop());
    },

    _renderOverlay() {
        if (this.screen === 'fishing') {
            fishing.render();
        } else {
            renderer.drawDock();
        }
    }
};

/* ---- 起動 ---- */
window.addEventListener('DOMContentLoaded', () => {
    game.init();
});
