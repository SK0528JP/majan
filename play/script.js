/**
 * Nordic Mahjong Trainer - Core Engine
 * 役割: ゲーム状態の管理、牌のロジック、UIへの描画指示
 */

// 1. 牌のデータ定義
const TILE_TYPES = {
    MAN: 'm', // 萬子
    PIN: 'p', // 筒子
    SOU: 's', // 索子
    JI:  'z'  // 字牌 (1:東, 2:南, 3:西, 4:北, 5:白, 6:發, 7:中)
};

class MahjongGame {
    constructor() {
        this.wall = [];         // 山
        this.hand = [];         // 手牌
        this.discards = [];     // 捨て牌
        this.doraIndicator = ''; // ドラ表示牌
        this.currentTsumo = null;
        this.isTenpai = false;
        this.waits = [];        // 待ち牌
        
        this.init();
    }

    // ゲームの初期化
    init() {
        this.generateWall();
        this.shuffle();
        this.deal();
        this.checkTenpai();
        this.render();
        this.setupEventListeners();
    }

    // 136枚の牌を生成
    generateWall() {
        this.wall = [];
        for (let type of [TILE_TYPES.MAN, TILE_TYPES.PIN, TILE_TYPES.SOU]) {
            for (let i = 1; i <= 9; i++) {
                for (let j = 0; j < 4; j++) this.wall.push(`${type}${i}`);
            }
        }
        for (let i = 1; i <= 7; i++) {
            for (let j = 0; j < 4; j++) this.wall.push(`${TILE_TYPES.JI}${i}`);
        }
    }

    // シャッフル (Fisher-Yates)
    shuffle() {
        for (let i = this.wall.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.wall[i], this.wall[j]] = [this.wall[j], this.wall[i]];
        }
    }

    // 配牌 (13枚)
    deal() {
        this.hand = this.wall.splice(0, 13);
        this.sortHand();
        this.tsumo();
    }

    // ツモ
    tsumo() {
        if (this.wall.length > 0) {
            this.currentTsumo = this.wall.pop();
            this.updateWallCount();
            this.render();
        } else {
            alert("流局です");
        }
    }

    // 打牌
    discard(index) {
        let discardedTile;
        if (index === -1) {
            discardedTile = this.currentTsumo;
            this.currentTsumo = null;
        } else {
            discardedTile = this.hand.splice(index, 1)[0];
            this.hand.push(this.currentTsumo);
            this.currentTsumo = null;
            this.sortHand();
        }
        
        this.discards.push(discardedTile);
        this.checkTenpai();
        this.tsumo();
    }

    // 理牌 (ソート)
    sortHand() {
        const order = { 'm': 1, 'p': 2, 's': 3, 'z': 4 };
        this.hand.sort((a, b) => {
            if (a[0] !== b[0]) return order[a[0]] - order[b[0]];
            return a[1] - b[1];
        });
    }

    // テンパイ判定 & 待ち牌計算 (簡易練習用エンジン)
    checkTenpai() {
        // ここに将来的に「役判定クラス」を連携させる
        // 今回はUIの更新のみ
        this.waits = this.calculateWaits(this.hand);
        this.updateHelperPanel();
    }

    calculateWaits(hand) {
        // 練習用ロジック：本来はここに全牌を仮ツモしてアガリ判定を回すアルゴリズムを入れる
        return []; // デフォルトは空
    }

    // --- UI 描画ロジック ---

    render() {
        this.renderHand();
        this.renderRiver();
        this.renderTsumo();
    }

    // 手牌の描画
    renderHand() {
        const handEl = document.getElementById('player-hand');
        handEl.innerHTML = '';
        this.hand.forEach((tile, index) => {
            const tileDiv = this.createTileElement(tile);
            tileDiv.onclick = () => this.discard(index);
            handEl.appendChild(tileDiv);
        });
    }

    // ツモ牌の描画
    renderTsumo() {
        const tsumoEl = document.getElementById('tsumo-slot');
        tsumoEl.innerHTML = '';
        if (this.currentTsumo) {
            const tileDiv = this.createTileElement(this.currentTsumo);
            tileDiv.classList.add('tsumo-tile');
            tileDiv.onclick = () => this.discard(-1);
            tsumoEl.appendChild(tileDiv);
        }
    }

    // 河の描画
    renderRiver() {
        const riverEl = document.getElementById('player-river');
        riverEl.innerHTML = '';
        this.discards.forEach(tile => {
            riverEl.appendChild(this.createTileElement(tile, true));
        });
    }

    // 牌エレメントの生成
    createTileElement(tileCode, isRiver = false) {
        const div = document.createElement('div');
        div.className = `tile ${this.getTileClass(tileCode)}`;
        // 文字列として牌を表示（将来的に画像へ差し替え可能）
        div.textContent = this.getTileSymbol(tileCode); 
        return div;
    }

    getTileClass(tileCode) {
        const type = tileCode[0];
        if (type === 'm') return 'tile-manzu';
        if (type === 'p') return 'tile-pinzu';
        if (type === 's') return 'tile-souzu';
        return 'tile-jihai';
    }

    // Unicodeの麻雀牌を使用（北欧デザインに合うフォントがあれば化けない）
    getTileSymbol(tileCode) {
        const type = tileCode[0];
        const num = parseInt(tileCode[1]);
        const baseDict = {
            'm': 0x1F007, // 萬子1
            'p': 0x1F019, // 筒子1
            's': 0x1F010, // 索子1
            'z': 0x1F000  // 字牌 (東)
        };
        // 厳密なUnicode順序ではないため、実際は画像やフォントを当てるのがベスト
        // ここでは練習用に簡易的なマッピング
        const symbols = {
            'm1': '一', 'm2': '二', 'm3': '三', 'm4': '四', 'm5': '五', 'm6': '六', 'm7': '七', 'm8': '八', 'm9': '九',
            'p1': '①', 'p2': '②', 'p3': '③', 'p4': '④', 'p5': '⑤', 'p6': '⑥', 'p7': '⑦', 'p8': '⑧', 'p9': '⑨',
            's1': '１', 's2': '２', 's3': '３', 's4': '４', 's5': '５', 's6': '６', 's7': '７', 's8': '８', 's9': '９',
            'z1': '東', 'z2': '南', 'z3': '西', 'z4': '北', 'z5': '白', 'z6': '發', 'z7': '中'
        };
        return symbols[tileCode] || tileCode;
    }

    updateWallCount() {
        document.getElementById('wall-count').textContent = this.wall.length;
    }

    updateHelperPanel() {
        const machiEl = document.getElementById('machi-display');
        if (this.waits.length > 0) {
            machiEl.textContent = this.waits.join(', ');
        } else {
            machiEl.textContent = "ノーテン";
        }
    }

    setupEventListeners() {
        document.getElementById('btn-restart').onclick = () => {
            if(confirm("新しく配牌し直しますか？")) this.init();
        };
    }
}

// ゲーム開始
window.onload = () => {
    const game = new MahjongGame();
};
