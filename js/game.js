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

        if (id === 'spot') this._buildSpotList();
        if (id === 'collection') this._buildCollection();
        if (id === 'shop') {
            document.getElementById('shop-money-amount').textContent = `💰 ${this.money}`;
            this._buildShop(document.getElementById('tab-rods').classList.contains('active') ? 'rods' : 'skills');
        }
    },

    /* ---- 釣り場リスト構築 ---- */
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

    /* ---- 味方にする ---- */
    _keepFish() {
        if (!this._pendingFish) return;
        const fish = this._pendingFish;
        this.allies.push({ ...fish, weight: this._pendingWeight });
        this.collection[fish.id] = true;
        this.catches++;
        this._updateHUD();
        this._pendingFish = null;
        this._returnToFishing();
    },

    /* ---- 売却 ---- */
    _sellFish() {
        if (!this._pendingFish) return;
        const fish = this._pendingFish;
        this.money += fish.value;
        this.collection[fish.id] = true;
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
            const caught = !!this.collection[fish.id];
            const item = document.createElement('div');
            item.className = 'collection-item ' + (caught ? 'caught' : 'unknown');
            item.innerHTML = `
                <span class="fish-emoji">${caught ? fish.emoji : '❓'}</span>
                <span class="fish-label">${caught ? fish.name : '???'}</span>
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
                const owned = this.ownedRods.find(r => r.id === rod.id);
                const equipped = this.equippedRod.id === rod.id;
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
        } else {
            SKILLS.forEach(skill => {
                const owned = this.learnedSkills.find(s => s.id === skill.id);
                const item = document.createElement('div');
                item.className = 'shop-item' + (owned ? ' owned' : '');
                
                let btnHtml = owned 
                    ? `<button class="btn-secondary btn-buy" disabled>習得済み</button>`
                    : `<button class="btn-glow small btn-buy" ${this.money < skill.cost ? 'disabled' : ''}>購入</button>`;

                item.innerHTML = `
                    <h3>${skill.name}</h3>
                    <p>${skill.desc}</p>
                    <div class="shop-item-cost">💰 ${skill.cost}</div>
                    ${btnHtml}
                `;

                const btn = item.querySelector('.btn-buy');
                if (btn && !btn.disabled) {
                    btn.addEventListener('click', () => {
                        if (this.money >= skill.cost) {
                            this.money -= skill.cost;
                            this.learnedSkills.push(skill);
                            document.getElementById('shop-money-amount').textContent = `💰 ${this.money}`;
                            this._buildShop('skills');
                        }
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
