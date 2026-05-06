class BattleSystem {
    constructor() {
        this.enemy = null;
        this.playerFish = null;
        this.isBattle = false;
        this.turn = 'player';
    }

    init() {
        if (!game.player.activeAlly) {
            alert('戦える仲間がいません！まずは釣りをしましょう。');
            return;
        }

        game.showScreen('battle');
        this.isBattle = true;
        this.playerFish = game.player.activeAlly;
        
        // ランダムな敵を選択
        const enemyData = GAME_DATA.enemies[Math.floor(Math.random() * GAME_DATA.enemies.length)];
        this.enemy = { ...enemyData, maxHp: enemyData.hp };

        this.updateUI();
        this.log(`${this.enemy.name} が現れた！`);
    }

    updateUI() {
        document.getElementById('enemy-name').textContent = this.enemy.name;
        document.getElementById('enemy-hp-fill').style.width = `${(this.enemy.hp / this.enemy.maxHp) * 100}%`;
        
        document.getElementById('player-fish-name').textContent = this.playerFish.name;
        document.getElementById('player-hp-fill').style.width = `${(this.playerFish.hp / this.playerFish.maxHp) * 100}%`;
    }

    log(msg) {
        document.getElementById('battle-message').textContent = msg;
    }

    command(type) {
        if (!this.isBattle || this.turn !== 'player') return;

        switch(type) {
            case 'attack':
                this.executeAttack(this.playerFish, this.enemy);
                break;
            case 'skill':
                this.log(`${this.playerFish.name} のスキル！（未実装）`);
                setTimeout(() => this.enemyTurn(), 1000);
                break;
            case 'run':
                this.log('逃げ出した！');
                setTimeout(() => game.showScreen('hub'), 1000);
                this.isBattle = false;
                break;
        }
    }

    executeAttack(attacker, target) {
        const dmg = Math.floor(attacker.atk * (0.8 + Math.random() * 0.4));
        target.hp = Math.max(0, target.hp - dmg);
        this.log(`${attacker.name} の攻撃！ ${target.name} に ${dmg} のダメージ！`);
        
        this.updateUI();

        if (target.hp <= 0) {
            this.win();
        } else {
            this.turn = 'enemy';
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    enemyTurn() {
        if (!this.isBattle) return;
        
        const dmg = Math.floor(this.enemy.atk * (0.8 + Math.random() * 0.4));
        this.playerFish.hp = Math.max(0, this.playerFish.hp - dmg);
        this.log(`${this.enemy.name} の攻撃！ ${this.playerFish.name} に ${dmg} のダメージ！`);
        
        this.updateUI();

        if (this.playerFish.hp <= 0) {
            this.lose();
        } else {
            this.turn = 'player';
        }
    }

    win() {
        this.isBattle = false;
        this.log(`${this.enemy.name} に勝利した！`);
        game.player.money += this.enemy.money;
        alert(`勝利！ 💰${this.enemy.money} を獲得しました。`);
        game.showScreen('hub');
    }

    lose() {
        this.isBattle = false;
        this.log(`${this.playerFish.name} は力尽きた...`);
        alert('敗北しました。拠点を戻ります。');
        this.playerFish.hp = this.playerFish.maxHp; // 復活
        game.showScreen('hub');
    }
}

const battle = new BattleSystem();
