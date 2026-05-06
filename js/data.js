/* ============================================
   さかな超大戦 - 魚データ & 釣り場データ
   ============================================ */

const FISH_DATABASE = [
    // ---- Cランク ----
    { id: "aji", name: "アジ", rarity: "C", hp: 50, atk: 10, spd: 20, value: 150, weight: { min: 0.1, max: 0.4 }, emoji: "🐟", color: "#6dc5d1", bodyColor: "#7fd4dc", finColor: "#4ba8b0", size: 26, desc: "速度に優れた万能魚。群れで泳ぐ。", difficulty: 0.8, spawnWeight: 25 },
    { id: "iwashi", name: "イワシ", rarity: "C", hp: 80, atk: 8, spd: 10, value: 100, weight: { min: 0.05, max: 0.15 }, emoji: "🐟", color: "#5f9ea0", bodyColor: "#78b4b6", finColor: "#3d7a7c", size: 22, desc: "耐久力抜群。のんびり泳ぐ。", difficulty: 0.7, spawnWeight: 28 },
    { id: "saba", name: "サバ", rarity: "C", hp: 60, atk: 18, spd: 12, value: 300, weight: { min: 0.3, max: 1.0 }, emoji: "🐠", color: "#2e86de", bodyColor: "#5fa8e8", finColor: "#1a6cb8", size: 32, desc: "攻撃重視の中型魚。力強い引き。", difficulty: 0.9, spawnWeight: 20 },
    { id: "funa", name: "フナ", rarity: "C", hp: 30, atk: 5, spd: 15, value: 50, weight: { min: 0.1, max: 0.3 }, emoji: "🐟", color: "#9e9e9e", bodyColor: "#bdbdbd", finColor: "#757575", size: 20, desc: "おなじみの淡水魚。", difficulty: 0.5, spawnWeight: 30 },
    { id: "haze", name: "ハゼ", rarity: "C", hp: 25, atk: 4, spd: 18, value: 80, weight: { min: 0.05, max: 0.15 }, emoji: "🐟", color: "#8d6e63", bodyColor: "#a1887f", finColor: "#6d4c41", size: 18, desc: "海底に潜む小さな魚。", difficulty: 0.6, spawnWeight: 25 },
    { id: "kisu", name: "キス", rarity: "C", hp: 40, atk: 8, spd: 22, value: 120, weight: { min: 0.1, max: 0.2 }, emoji: "🐟", color: "#e8dac3", bodyColor: "#f5ebdc", finColor: "#d1bfae", size: 24, desc: "砂地の女王。動きが素早い。", difficulty: 0.8, spawnWeight: 22 },
    { id: "kasago", name: "カサゴ", rarity: "C", hp: 60, atk: 12, spd: 10, value: 200, weight: { min: 0.2, max: 0.5 }, emoji: "🐠", color: "#d35400", bodyColor: "#e67e22", finColor: "#e74c3c", size: 25, desc: "岩場に潜む根魚。", difficulty: 0.7, spawnWeight: 18 },
    { id: "mebaru", name: "メバル", rarity: "C", hp: 55, atk: 10, spd: 14, value: 250, weight: { min: 0.2, max: 0.6 }, emoji: "🐟", color: "#34495e", bodyColor: "#2c3e50", finColor: "#1a252f", size: 28, desc: "大きな目が特徴。引きが楽しい。", difficulty: 0.8, spawnWeight: 15 },
    { id: "sanma", name: "サンマ", rarity: "C", hp: 45, atk: 15, spd: 25, value: 180, weight: { min: 0.1, max: 0.3 }, emoji: "🐟", color: "#95a5a6", bodyColor: "#bdc3c7", finColor: "#7f8c8d", size: 30, desc: "秋の味覚。一直線に泳ぐ。", difficulty: 0.8, spawnWeight: 20 },
    { id: "wakasagi", name: "ワカサギ", rarity: "C", hp: 15, atk: 2, spd: 30, value: 30, weight: { min: 0.01, max: 0.03 }, emoji: "🐟", color: "#ecf0f1", bodyColor: "#ffffff", finColor: "#bdc3c7", size: 15, desc: "氷上釣りの定番。極小サイズ。", difficulty: 0.5, spawnWeight: 35 },

    // ---- Bランク ----
    { id: "suzuki", name: "スズキ", rarity: "B", hp: 90, atk: 22, spd: 14, value: 500, weight: { min: 1.0, max: 5.0 }, emoji: "🐠", color: "#c0c0c0", bodyColor: "#d4d4d4", finColor: "#9e9e9e", size: 38, desc: "夜行性のハンター。引きが強い。", difficulty: 1.5, spawnWeight: 14 },
    { id: "hirame", name: "ヒラメ", rarity: "B", hp: 100, atk: 35, spd: 22, value: 1500, weight: { min: 1.5, max: 6.0 }, emoji: "🐡", color: "#8b7355", bodyColor: "#a08c6e", finColor: "#6b5642", size: 42, desc: "海底に潜む高級魚。素早い反撃注意。", difficulty: 1.8, spawnWeight: 10 },
    { id: "kurodai", name: "クロダイ", rarity: "B", hp: 80, atk: 20, spd: 15, value: 800, weight: { min: 1.0, max: 3.0 }, emoji: "🐠", color: "#2c3e50", bodyColor: "#34495e", finColor: "#1a252f", size: 36, desc: "警戒心が強い。いぶし銀の魚体。", difficulty: 1.4, spawnWeight: 12 },
    { id: "karei", name: "カレイ", rarity: "B", hp: 90, atk: 15, spd: 12, value: 600, weight: { min: 0.8, max: 2.5 }, emoji: "🐡", color: "#7f8c8d", bodyColor: "#95a5a6", finColor: "#34495e", size: 40, desc: "ヒラメに似ているが目が右側。", difficulty: 1.3, spawnWeight: 14 },
    { id: "tachiuo", name: "タチウオ", rarity: "B", hp: 70, atk: 30, spd: 20, value: 1000, weight: { min: 0.5, max: 2.0 }, emoji: "🐉", color: "#ecf0f1", bodyColor: "#ffffff", finColor: "#bdc3c7", size: 45, desc: "太刀のような姿。鋭い歯を持つ。", difficulty: 1.6, spawnWeight: 11 },
    { id: "kawahagi", name: "カワハギ", rarity: "B", hp: 60, atk: 10, spd: 25, value: 700, weight: { min: 0.3, max: 0.8 }, emoji: "🐠", color: "#f39c12", bodyColor: "#f1c40f", finColor: "#e67e22", size: 30, desc: "餌取りの名人。アタリが分かりにくい。", difficulty: 1.5, spawnWeight: 13 },
    { id: "ishidai", name: "イシダイ", rarity: "B", hp: 110, atk: 25, spd: 14, value: 1200, weight: { min: 1.5, max: 4.0 }, emoji: "🐟", color: "#34495e", bodyColor: "#7f8c8d", finColor: "#2c3e50", size: 38, desc: "磯の王者。凄まじい突進力。", difficulty: 1.7, spawnWeight: 9 },
    { id: "hokke", name: "ホッケ", rarity: "B", hp: 85, atk: 18, spd: 16, value: 400, weight: { min: 0.5, max: 1.5 }, emoji: "🐟", color: "#d35400", bodyColor: "#e67e22", finColor: "#a04000", size: 34, desc: "群れで回遊する美味しい魚。", difficulty: 1.2, spawnWeight: 15 },
    { id: "madako", name: "マダコ", rarity: "B", hp: 150, atk: 10, spd: 8, value: 900, weight: { min: 1.0, max: 5.0 }, emoji: "🐙", color: "#e74c3c", bodyColor: "#c0392b", finColor: "#922b21", size: 40, desc: "海底にはりつくタコ。引き剥がすのが大変。", difficulty: 1.6, spawnWeight: 10 },
    { id: "sake", name: "サケ", rarity: "B", hp: 100, atk: 22, spd: 18, value: 1100, weight: { min: 2.0, max: 5.0 }, emoji: "🐟", color: "#e67e22", bodyColor: "#d35400", finColor: "#935116", size: 42, desc: "川を遡上する強靭な魚。", difficulty: 1.5, spawnWeight: 10 },

    // ---- Aランク ----
    { id: "tai", name: "タイ", rarity: "A", hp: 120, atk: 28, spd: 16, value: 1200, weight: { min: 2.0, max: 8.0 }, emoji: "🎣", color: "#e74c3c", bodyColor: "#ef7a6d", finColor: "#c0392b", size: 40, desc: "めでたい魚の王様。美しい赤色。", difficulty: 2.0, spawnWeight: 8 },
    { id: "kanpachi", name: "カンパチ", rarity: "A", hp: 130, atk: 30, spd: 25, value: 1800, weight: { min: 3.0, max: 10.0 }, emoji: "🐟", color: "#f1c40f", bodyColor: "#f39c12", finColor: "#d4ac0d", size: 45, desc: "青物の代表格。引きの強さはAランク随一。", difficulty: 2.2, spawnWeight: 7 },
    { id: "hiramasa", name: "ヒラマサ", rarity: "A", hp: 140, atk: 35, spd: 28, value: 2000, weight: { min: 4.0, max: 15.0 }, emoji: "🐟", color: "#f39c12", bodyColor: "#e67e22", finColor: "#d35400", size: 48, desc: "海のスプリンター。猛スピードで逃げ回る。", difficulty: 2.4, spawnWeight: 6 },
    { id: "kue", name: "クエ", rarity: "A", hp: 200, atk: 40, spd: 10, value: 4000, weight: { min: 10.0, max: 30.0 }, emoji: "🐡", color: "#2c3e50", bodyColor: "#34495e", finColor: "#1a252f", size: 55, desc: "幻の高級魚。岩の隙間に潜り込もうとする。", difficulty: 2.5, spawnWeight: 4 },
    { id: "aoriika", name: "アオリイカ", rarity: "A", hp: 80, atk: 25, spd: 40, value: 1500, weight: { min: 1.0, max: 4.0 }, emoji: "🦑", color: "#ecf0f1", bodyColor: "#bdc3c7", finColor: "#95a5a6", size: 35, desc: "イカの王様。ジェット噴射で急加速する。", difficulty: 2.1, spawnWeight: 8 },
    { id: "iseebi", name: "イセエビ", rarity: "A", hp: 120, atk: 15, spd: 15, value: 3000, weight: { min: 0.5, max: 2.0 }, emoji: "🦞", color: "#c0392b", bodyColor: "#e74c3c", finColor: "#922b21", size: 32, desc: "立派なヒゲを持つ高級エビ。", difficulty: 1.9, spawnWeight: 6 },
    { id: "onikasago", name: "オニカサゴ", rarity: "A", hp: 150, atk: 45, spd: 12, value: 2500, weight: { min: 1.0, max: 3.0 }, emoji: "🐠", color: "#d35400", bodyColor: "#e67e22", finColor: "#c0392b", size: 35, desc: "猛毒のトゲを持つ危険な魚。", difficulty: 2.3, spawnWeight: 7 },
    { id: "shiira", name: "シイラ", rarity: "A", hp: 110, atk: 38, spd: 35, value: 1400, weight: { min: 5.0, max: 15.0 }, emoji: "🐟", color: "#2ecc71", bodyColor: "#27ae60", finColor: "#f1c40f", size: 50, desc: "虹色に輝く大型魚。ジャンプで抵抗する。", difficulty: 2.1, spawnWeight: 8 },
    { id: "ankou", name: "アンコウ", rarity: "A", hp: 250, atk: 20, spd: 5, value: 2800, weight: { min: 5.0, max: 20.0 }, emoji: "🐡", color: "#7f8c8d", bodyColor: "#95a5a6", finColor: "#34495e", size: 45, desc: "深海の待ち伏せハンター。動きは鈍い。", difficulty: 1.8, spawnWeight: 6 },
    { id: "utsubo", name: "ウツボ", rarity: "A", hp: 160, atk: 50, spd: 18, value: 1200, weight: { min: 2.0, max: 6.0 }, emoji: "🐉", color: "#f1c40f", bodyColor: "#e67e22", finColor: "#d35400", size: 48, desc: "海のギャング。鋭い歯で暴れ回る。", difficulty: 2.2, spawnWeight: 7 },

    // ---- Sランク ----
    { id: "maguro", name: "マグロ", rarity: "S", hp: 250, atk: 50, spd: 30, value: 5000, weight: { min: 30, max: 200 }, emoji: "🐟", color: "#1a1a5e", bodyColor: "#2e2e7a", finColor: "#0d0d42", size: 55, desc: "海の弾丸。圧倒的なパワーとスピード。", difficulty: 3.0, spawnWeight: 3 },
    { id: "kajiki", name: "カジキマグロ", rarity: "S", hp: 220, atk: 60, spd: 45, value: 8000, weight: { min: 50, max: 150 }, emoji: "🐟", color: "#2980b9", bodyColor: "#3498db", finColor: "#1f618d", size: 60, desc: "鋭い吻（ふん）を持つ最速クラスの魚。", difficulty: 3.2, spawnWeight: 2 },
    { id: "bashou", name: "バショウカジキ", rarity: "S", hp: 200, atk: 55, spd: 55, value: 10000, weight: { min: 40, max: 100 }, emoji: "🐟", color: "#3498db", bodyColor: "#5dade2", finColor: "#2874a6", size: 62, desc: "巨大な背ビレを持つ。凄まじいスピード。", difficulty: 3.4, spawnWeight: 1.5 },
    { id: "daiouika", name: "ダイオウイカ", rarity: "S", hp: 350, atk: 40, spd: 20, value: 12000, weight: { min: 100, max: 300 }, emoji: "🦑", color: "#e74c3c", bodyColor: "#c0392b", finColor: "#922b21", size: 65, desc: "深海の巨大イカ。腕を振り回して暴れる。", difficulty: 3.1, spawnWeight: 2 },
    { id: "hohojiro", name: "ホホジロザメ", rarity: "S", hp: 400, atk: 80, spd: 35, value: 15000, weight: { min: 500, max: 1500 }, emoji: "🦈", color: "#bdc3c7", bodyColor: "#ecf0f1", finColor: "#7f8c8d", size: 70, desc: "恐怖の人食いザメ。圧倒的な暴力。", difficulty: 3.6, spawnWeight: 1 },
    { id: "shumoku", name: "シュモクザメ", rarity: "S", hp: 320, atk: 65, spd: 30, value: 13000, weight: { min: 200, max: 500 }, emoji: "🦈", color: "#7f8c8d", bodyColor: "#95a5a6", finColor: "#34495e", size: 60, desc: "ハンマーヘッド。広域の視界を持つ。", difficulty: 3.3, spawnWeight: 1.5 },
    { id: "coelacanth", name: "シーラカンス", rarity: "S", hp: 300, atk: 30, spd: 15, value: 20000, weight: { min: 50, max: 100 }, emoji: "🐟", color: "#2c3e50", bodyColor: "#34495e", finColor: "#1a252f", size: 55, desc: "生きた化石。深海でひっそりと暮らす。", difficulty: 2.9, spawnWeight: 0.8 },
    { id: "manta", name: "マンタ", rarity: "S", hp: 450, atk: 20, spd: 25, value: 9000, weight: { min: 1000, max: 2000 }, emoji: "🦇", color: "#34495e", bodyColor: "#2c3e50", finColor: "#1a252f", size: 68, desc: "海を羽ばたくように泳ぐ巨大エイ。", difficulty: 3.0, spawnWeight: 2 },
    { id: "jinbe", name: "ジンベエザメ", rarity: "S", hp: 800, atk: 10, spd: 10, value: 25000, weight: { min: 5000, max: 10000 }, emoji: "🦈", color: "#2980b9", bodyColor: "#3498db", finColor: "#ecf0f1", size: 85, desc: "世界最大の魚類。動きは非常に穏やか。", difficulty: 2.8, spawnWeight: 0.5 },
    { id: "shachi", name: "シャチ", rarity: "S", hp: 500, atk: 90, spd: 40, value: 30000, weight: { min: 2000, max: 5000 }, emoji: "🐬", color: "#000000", bodyColor: "#333333", finColor: "#ffffff", size: 75, desc: "海の最強ハンター。高度な知能で抵抗する。", difficulty: 3.8, spawnWeight: 0.5 },

    // ---- SSランク (超絶レア) ----
    { id: "ryugu", name: "リュウグウノツカイ", rarity: "SS", hp: 500, atk: 80, spd: 10, value: 50000, weight: { min: 50, max: 300 }, emoji: "🐉", color: "#e0e0e0", bodyColor: "#f5f5f5", finColor: "#ff4444", size: 70, desc: "伝説の深海魚。姿を見せること自体が奇跡。", difficulty: 4.0, spawnWeight: 0.05 },
    { id: "trex", name: "T-レックス(水中)", rarity: "SS", hp: 999, atk: 150, spd: 40, value: 99999, weight: { min: 5000, max: 9000 }, emoji: "🦖", color: "#2d5016", bodyColor: "#4a7a28", finColor: "#1a3008", size: 80, desc: "水中適応した暴君竜。釣り上げるのは至難の業。", difficulty: 5.0, spawnWeight: 0.02 },
    { id: "megalodon", name: "メガロドン", rarity: "SS", hp: 1200, atk: 200, spd: 50, value: 150000, weight: { min: 20000, max: 50000 }, emoji: "🦈", color: "#1a252f", bodyColor: "#2c3e50", finColor: "#000000", size: 90, desc: "太古の巨大ザメ。全てを喰らい尽くす。", difficulty: 5.5, spawnWeight: 0.01 },
    { id: "kraken", name: "クラーケン", rarity: "SS", hp: 1500, atk: 120, spd: 30, value: 120000, weight: { min: 10000, max: 30000 }, emoji: "🦑", color: "#8e44ad", bodyColor: "#9b59b6", finColor: "#4a235a", size: 85, desc: "海を引きずり込む伝説の怪物。", difficulty: 5.2, spawnWeight: 0.01 },
    { id: "nessie", name: "ネッシー", rarity: "SS", hp: 2000, atk: 100, spd: 20, value: 200000, weight: { min: 5000, max: 15000 }, emoji: "🦕", color: "#16a085", bodyColor: "#1abc9c", finColor: "#0e6655", size: 82, desc: "ネス湖から迷い込んだ首長竜の生き残り。", difficulty: 4.8, spawnWeight: 0.02 }
];

const FISHING_SPOTS = [
    {
        id: "pond",
        name: "はじまりの池",
        icon: "🏞️",
        desc: "穏やかな池。初心者に最適。",
        unlocked: true,
        unlockCost: 0,
        unlockReq: null,
        fishIds: ["funa", "wakasagi", "haze", "kisu", "iwashi", "saba", "suzuki", "sake"],
        bgGradient: ["#0a3d62", "#079992"],
        waterColor: "rgba(16, 120, 140, 0.6)"
    },
    {
        id: "shore",
        name: "磯の浜辺",
        icon: "🏖️",
        desc: "波打つ海岸。中型魚が狙える。",
        unlocked: false,
        unlockCost: 500,
        unlockReq: { fishId: "saba", count: 3 }, // 池でサバを3匹
        fishIds: ["aji", "iwashi", "saba", "kasago", "mebaru", "sanma", "suzuki", "hirame", "kurodai", "karei", "tachiuo", "kawahagi", "ishidai", "hokke", "madako", "tai", "aoriika", "iseebi"],
        bgGradient: ["#0c2461", "#1e3799"],
        waterColor: "rgba(30, 55, 153, 0.6)"
    },
    {
        id: "offshore",
        name: "沖合い",
        icon: "⛵",
        desc: "大物が潜む外洋。上級者向け。",
        unlocked: false,
        unlockCost: 3000,
        unlockReq: { fishId: "tai", count: 2 }, // 浜辺でタイを2匹
        fishIds: ["saba", "suzuki", "hirame", "tachiuo", "ishidai", "tai", "kanpachi", "hiramasa", "kue", "onikasago", "shiira", "maguro", "kajiki", "bashou", "manta"],
        bgGradient: ["#0a1931", "#185adb"],
        waterColor: "rgba(24, 90, 219, 0.5)"
    },
    {
        id: "abyss",
        name: "深海の裂け目",
        icon: "🌊",
        desc: "伝説級の生物が棲む暗黒の深海。",
        unlocked: false,
        unlockCost: 15000,
        unlockReq: { fishId: "maguro", count: 1 }, // 沖合いでマグロを1匹
        fishIds: ["kue", "ankou", "utsubo", "maguro", "daiouika", "hohojiro", "shumoku", "coelacanth", "jinbe", "shachi", "ryugu", "trex", "megalodon", "kraken", "nessie"],
        bgGradient: ["#000000", "#0d0d3b"],
        waterColor: "rgba(13, 13, 59, 0.7)"
    }
];

const RODS = [
    { id: "bamboo", name: "竹竿", desc: "初心者用の竹の竿", diffMod: 1.0, cost: 0, color: "#a1887f" },
    { id: "carbon", name: "カーボンロッド", desc: "軽量で扱いやすい", diffMod: 0.8, cost: 2000, color: "#546e7a" },
    { id: "titanium", name: "チタンロッド", desc: "高い強度と感度", diffMod: 0.6, cost: 8000, color: "#90a4ae" },
    { id: "legend", name: "伝説の竿", desc: "伝説のアングラーが遺した竿", diffMod: 0.4, cost: 30000, color: "#ffd700" }
];

const SKILLS = [
    { id: "steady", name: "安定の心", desc: "ゲージ減少速度-30%", cost: 1500, effect: { drainMod: 0.7 } },
    { id: "quickfill", name: "高速リール", desc: "ゲージ増加速度+40%", cost: 3000, effect: { fillMod: 1.4 } },
    { id: "patience", name: "忍耐の極意", desc: "逃走猶予時間+3秒", cost: 5000, effect: { escapeTimeMod: 3 } },
    { id: "wideview", name: "広域探知", desc: "ゾーン幅+20%", cost: 10000, effect: { zoneMod: 1.2 } }
];
