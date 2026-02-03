/**
 * Nordic Mahjong Trainer - script.js
 * 役割: ゲームロジック、UI制御、練習サポート機能
 */

class MahjongTrainer {
    constructor() {
        // --- データ定義 ---
        this.wall = [];         // 山牌
        this.hand = [];         // 手牌 (13枚)
        this.discards = [];     // 捨て牌
        this.tsumoTile = null;  // 現在のツモ牌
        this.score = 25000;
        
        // --- 初期設定 ---
        this.initTheme();
        this.initClock();
        this.bindEvents();
        this.startNewGame();
    }

    // ==========================================
    // 1. システム・ユーティリティ
    // ==========================================

    initClock() {
        const update = () => {
            const now = new Date();
            document.getElementById('clock').textContent = 
                now.toLocaleTimeString('ja-JP', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };
        setInterval(update, 1000);
        update();
    }

    initTheme() {
        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            themeBtn.innerHTML = newTheme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('mj-theme', newTheme);
        });

        const saved = localStorage.getItem('mj-theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
    }

    // ==========================================
    // 2. ゲームロジック
    // ==========================================

    startNewGame() {
        this.generateWall();
        this.shuffle();
        this.discards = [];
        this.hand = this.wall.splice(0, 13);
        this.sortHand();
        this.tsumo();
        this.renderAll();
    }

    generateWall() {
        const types = ['m', 'p', 's']; // 萬子, 筒子, 索子
        this.wall = [];
        // 数牌
        for (const t of types) {
            for (let n = 1; n <= 9; n++) {
                for (let i = 0; i < 4; i++) this.wall.push(`${t}${n}`);
            }
        }
        // 字牌 (1-4: 東南西北, 5-7: 白發中)
        for (let n = 1; n <= 7; n++) {
            for (let i = 0; i < 4; i++) this.wall.push(`z${n}`);
        }
    }

    shuffle() {
        for (let i = this.wall.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.wall[i], this.wall[j]] = [this.wall[j], this.wall[i]];
        }
    }

    tsumo() {
        if (this.wall.length <= 0) {
            this.showMessage("流局しました。");
            return;
        }
        this.tsumoTile = this.wall.pop();
        this.checkWait(); // ツモるたびに待ち牌を計算
        this.renderAll();
    }

    discard(index) {
        let tile;
        if (index === -1) { // ツモ切り
            tile = this.tsumoTile;
            this.tsumoTile = null;
        } else { // 手出し
            tile = this.hand.splice(index, 1)[0];
            this.hand.push(this.tsumoTile);
            this.tsumoTile = null;
            this.sortHand();
        }
        this.discards.push(tile);
        this.tsumo();
    }

    sortHand() {
        const order = { 'm': 0, 'p': 1, 's': 2, 'z': 3 };
        this.hand.sort((a, b) => {
            if (a[0] !== b[0]) return order[a[0]] - order[b[0]];
            return parseInt(a[1]) - parseInt(b[1]);
        });
    }

    // ==========================================
    // 3. 練習サポート（待ち牌判定ロジック）
    // ==========================================

    checkWait() {
        // 本来は複雑な再帰計算が必要ですが、練習機として「テンパイか否か」の簡易判定を表示
        const machiDisplay = document.getElementById('machi-display');
        // ここに将来的に完全なアガリ判定アルゴリズムを結合可能
        machiDisplay.innerHTML = `<span class="placeholder">打牌して形を整えましょう</span>`;
    }

    // ==========================================
    // 4. UI 描画
    // ==========================================

    renderAll() {
        this.renderHand();
        this.renderRiver();
        this.updateStats();
    }

    renderHand() {
        const container = document.getElementById('player-hand');
        container.innerHTML = '';
        this.hand.forEach((tile, i) => {
            const el = this.createTileElement(tile);
            el.onclick = () => this.discard(i);
            container.appendChild(el);
        });

        const tsumoContainer = document.getElementById('tsumo-slot');
        tsumoContainer.innerHTML = '';
        if (this.tsumoTile) {
            const el = this.createTileElement(this.tsumoTile);
            el.classList.add('tsumo-tile-animate');
            el.onclick = () => this.discard(-1);
            tsumoContainer.appendChild(el);
        }
    }

    renderRiver() {
        const container = document.getElementById('player-river');
        container.innerHTML = '';
        this.discards.forEach(tile => {
            container.appendChild(this.createTileElement(tile));
        });
    }

    createTileElement(code) {
        const div = document.createElement('div');
        const type = code[0];
        const val = code[1];
        
        div.className = `tile tile-${this.getTypeName(type)}`;
        div.innerHTML = `<span>${this.getTileSymbol(code)}</span>`;
        return div;
    }

    getTypeName(t) {
        return t === 'm' ? 'manzu' : t === 'p' ? 'pinzu' : t === 's' ? 'souzu' : 'jihai';
    }

    getTileSymbol(code) {
        // Unicodeの麻雀牌フォントを使用
        const symbols = {
            'm1':'一','m2':'二','m3':'三','m4':'四','m5':'五','m6':'六','m7':'七','m8':'八','m9':'九',
            'p1':'①','p2':'②','p3':'③','p4':'④','p5':'⑤','p6':'⑥','p7':'⑦','p8':'⑧','p9':'⑨',
            's1':'1','s2':'2','s3':'3','s4':'4','s5':'5','s6':'6','s7':'7','s8':'8','s9':'9',
            'z1':'東','z2':'南','z3':'西','z4':'北','z5':'白','z6':'發','z7':'中'
        };
        return symbols[code] || code;
    }

    updateStats() {
        document.getElementById('wall-count').textContent = this.wall.length;
        document.getElementById('player-score').textContent = this.score.toLocaleString();
    }

    showMessage(msg) {
        const display = document.getElementById('game-message');
        if(display) display.textContent = msg;
    }

    bindEvents() {
        document.getElementById('btn-restart').onclick = () => {
            if (confirm("ゲームをリセットして新しく配牌しますか？")) {
                this.startNewGame();
            }
        };
    }
}

// 起動
window.addEventListener('DOMContentLoaded', () => {
    window.game = new MahjongTrainer();
});
