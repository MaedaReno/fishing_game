class GameEngine {
    constructor() {
        this.player = {
            name: "アングラー・サマナー",
            money: 1000,
            allies: [],
            activeAlly: null,
            inventory: []
        };
        this.currentScreen = 'title';
        this.state = 'idle';
    }

    init() {
        this.showScreen('title');
        this.setupEventListeners();
        ui.initCanvas();
    }

    setupEventListeners() {
        document.getElementById('btn-start').addEventListener('click', () => {
            this.showScreen('starter');
        });
        document.getElementById('btn-to-fishing').addEventListener('click', () => {
            fishing.start();
        });
        document.getElementById('btn-to-battle').addEventListener('click', () => {
            battle.init();
        });
        document.getElementById('btn-to-upgrade').addEventListener('click', () => {
            alert('強化機能は開発中です！');
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`screen-${screenId}`).classList.add('active');
        this.currentScreen = screenId;
        
        if (screenId === 'hub') {
            this.updateHUD();
        }
    }

    updateHUD() {
        document.getElementById('player-money').textContent = `💰 ${this.player.money}`;
    }

    selectStarter(key) {
        const fish = { ...GAME_DATA.starters[key] };
        this.player.allies.push(fish);
        this.player.activeAlly = fish;
        alert(`${fish.name}を仲間にした！`);
        this.showScreen('hub');
    }
}

const game = new GameEngine();
