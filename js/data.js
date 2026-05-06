/* ============================================
   さかな超大戦 - 魚データ & 釣り場データ
   ============================================ */

const FISH_DATABASE = [
    // ---- Cランク ----
    {
        id: "medaka",
        name: "メダカ",
        rarity: "C",
        hp: 20, atk: 4, spd: 18,
        value: 80,
        weight: { min: 0.02, max: 0.05 },
        emoji: "🐟",
        color: "#a8d8ea",
        bodyColor: "#c9e8f5",
        finColor: "#8cc7de",
        size: 18,
        desc: "小さくてかわいい淡水魚。初心者向け。",
        difficulty: 0.6,
        spawnWeight: 30
    },
    {
        id: "aji",
        name: "アジ",
        rarity: "C",
        hp: 50, atk: 10, spd: 20,
        value: 150,
        weight: { min: 0.1, max: 0.4 },
        emoji: "🐟",
        color: "#6dc5d1",
        bodyColor: "#7fd4dc",
        finColor: "#4ba8b0",
        size: 26,
        desc: "速度に優れた万能魚。群れで泳ぐ。",
        difficulty: 0.8,
        spawnWeight: 25
    },
    {
        id: "iwashi",
        name: "イワシ",
        rarity: "C",
        hp: 80, atk: 8, spd: 10,
        value: 100,
        weight: { min: 0.05, max: 0.15 },
        emoji: "🐟",
        color: "#5f9ea0",
        bodyColor: "#78b4b6",
        finColor: "#3d7a7c",
        size: 22,
        desc: "耐久力抜群。のんびり泳ぐ。",
        difficulty: 0.7,
        spawnWeight: 28
    },
    // ---- Bランク ----
    {
        id: "saba",
        name: "サバ",
        rarity: "B",
        hp: 60, atk: 18, spd: 12,
        value: 300,
        weight: { min: 0.3, max: 1.0 },
        emoji: "🐠",
        color: "#2e86de",
        bodyColor: "#5fa8e8",
        finColor: "#1a6cb8",
        size: 32,
        desc: "攻撃重視の中型魚。力強い引き。",
        difficulty: 1.2,
        spawnWeight: 18
    },
    {
        id: "suzuki",
        name: "スズキ",
        rarity: "B",
        hp: 90, atk: 22, spd: 14,
        value: 500,
        weight: { min: 1.0, max: 5.0 },
        emoji: "🐠",
        color: "#c0c0c0",
        bodyColor: "#d4d4d4",
        finColor: "#9e9e9e",
        size: 38,
        desc: "夜行性のハンター。引きが強い。",
        difficulty: 1.5,
        spawnWeight: 14
    },
    // ---- Aランク ----
    {
        id: "tai",
        name: "タイ",
        rarity: "A",
        hp: 120, atk: 28, spd: 16,
        value: 1200,
        weight: { min: 2.0, max: 8.0 },
        emoji: "🎣",
        color: "#e74c3c",
        bodyColor: "#ef7a6d",
        finColor: "#c0392b",
        size: 40,
        desc: "めでたい魚の王様。美しい赤色。",
        difficulty: 2.0,
        spawnWeight: 10
    },
    {
        id: "hirame",
        name: "ヒラメ",
        rarity: "A",
        hp: 100, atk: 35, spd: 22,
        value: 1500,
        weight: { min: 1.5, max: 6.0 },
        emoji: "🐡",
        color: "#8b7355",
        bodyColor: "#a08c6e",
        finColor: "#6b5642",
        size: 42,
        desc: "海底に潜む高級魚。素早い反撃注意。",
        difficulty: 2.2,
        spawnWeight: 8
    },
    // ---- Sランク ----
    {
        id: "maguro",
        name: "マグロ",
        rarity: "S",
        hp: 250, atk: 50, spd: 30,
        value: 5000,
        weight: { min: 30, max: 200 },
        emoji: "🐟",
        color: "#1a1a5e",
        bodyColor: "#2e2e7a",
        finColor: "#0d0d42",
        size: 55,
        desc: "海の弾丸。圧倒的なパワーとスピード。",
        difficulty: 3.0,
        spawnWeight: 5
    },
    // ---- SSランク ----
    {
        id: "ryugu",
        name: "リュウグウノツカイ",
        rarity: "SS",
        hp: 500, atk: 80, spd: 10,
        value: 20000,
        weight: { min: 50, max: 300 },
        emoji: "🐉",
        color: "#e0e0e0",
        bodyColor: "#f5f5f5",
        finColor: "#ff4444",
        size: 70,
        desc: "伝説の深海魚。姿を見せること自体が奇跡。",
        difficulty: 4.0,
        spawnWeight: 2
    },
    // ---- SSRランク ----
    {
        id: "trex",
        name: "T-レックス(水中)",
        rarity: "SSR",
        hp: 999, atk: 150, spd: 40,
        value: 99999,
        weight: { min: 5000, max: 9000 },
        emoji: "🦖",
        color: "#2d5016",
        bodyColor: "#4a7a28",
        finColor: "#1a3008",
        size: 80,
        desc: "水中適応した暴君竜。釣り上げるのは伝説級。",
        difficulty: 5.0,
        spawnWeight: 1
    }
];

const FISHING_SPOTS = [
    {
        id: "pond",
        name: "はじまりの池",
        icon: "🏞️",
        desc: "穏やかな池。初心者に最適。",
        unlocked: true,
        fishIds: ["medaka", "aji", "iwashi"],
        bgGradient: ["#0a3d62", "#079992"],
        waterColor: "rgba(16, 120, 140, 0.6)"
    },
    {
        id: "shore",
        name: "磯の浜辺",
        icon: "🏖️",
        desc: "波打つ海岸。中型魚が狙える。",
        unlocked: true,
        fishIds: ["aji", "iwashi", "saba", "suzuki"],
        bgGradient: ["#0c2461", "#1e3799"],
        waterColor: "rgba(30, 55, 153, 0.6)"
    },
    {
        id: "offshore",
        name: "沖合い",
        icon: "⛵",
        desc: "大物が潜む外洋。上級者向け。",
        unlocked: true,
        fishIds: ["saba", "suzuki", "tai", "hirame", "maguro"],
        bgGradient: ["#0a1931", "#185adb"],
        waterColor: "rgba(24, 90, 219, 0.5)"
    },
    {
        id: "abyss",
        name: "深海の裂け目",
        icon: "🌊",
        desc: "伝説級の魚が棲む暗黒の深海。",
        unlocked: true,
        fishIds: ["maguro", "ryugu", "trex"],
        bgGradient: ["#000000", "#0d0d3b"],
        waterColor: "rgba(13, 13, 59, 0.7)"
    }
];
