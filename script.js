/**
 * Mahjong Nordic Guide - Interactive Script
 * コンセプト: 「難解な麻雀を、パズルを解くように楽しく学ぶ」
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. スムーススクロール & ナビゲーション制御
    initNavigation();

    // 2. 用語翻訳ツールチップ (用語をクリックすると意味を表示)
    initTermDictionary();

    // 3. 役のビジュアルシミュレーター (Before/After 切り替え)
    initYakuSimulator();

    // 4. スクロール進捗バーの生成
    initProgressBar();

    // 5. ちょっとした遊び心（隠し要素）
    console.log("%c🀄 Mahjong Nordic Guide: 準備完了！素敵な麻雀ライフを。", "color: #4A90E2; font-weight: bold; font-size: 1.2rem;");
});

/**
 * 高性能なナビゲーション制御
 * IntersectionObserverを使用して、今読んでいるセクションを正確にハイライトします。
 */
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('section');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // 画面中央付近にきたらアクティブ
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateNavActiveState(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    function updateNavActiveState(id) {
        navBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick')?.includes(id)) {
                btn.classList.add('active');
            }
        });
    }
}

/**
 * 用語翻訳ツールチップ
 * HTML内の .term-label をスキャンし、クリックで解説を表示します。
 */
function initTermDictionary() {
    const terms = document.querySelectorAll('.term-label');
    
    terms.forEach(term => {
        term.style.cursor = 'help';
        term.addEventListener('click', (e) => {
            const text = e.target.innerText;
            const explanation = getExplanation(text);
            
            // シンプルなアラートの代わりに、北欧デザイン風の通知を表示
            showToast(`【${text}】: ${explanation}`);
        });
    });
}

function getExplanation(term) {
    const dictionary = {
        '面子': 'メンツ。3枚1組のセットのこと。',
        '雀頭': 'ジャントウ。2枚1組のペア（アタマ）のこと。',
        '門前': 'メンゼン。ポンやチーを一度もしていない「自力」の状態。',
        '翻': 'ハン。役の「強さ」を表す単位。多いほど点数が高い！',
        '聴牌': 'テンパイ。あと1枚であがりになる「王手」の状態。'
    };
    return dictionary[term] || '麻雀の専門用語です。少しずつ覚えていきましょう。';
}

/**
 * 役のビジュアルシミュレーター
 * 「ただ揃っただけ」と「役があってあがれる」の違いをボタンで切り替えます。
 */
function initYakuSimulator() {
    const simulatorArea = document.querySelector('#goal'); // ゲームの目的セクションに挿入
    if (!simulatorArea) return;

    const simHTML = `
        <div class="info-box success" style="margin-top: 2rem; border: 2px solid var(--clr-accent);">
            <h3 style="margin-top:0;"><i class="fa-solid fa-wand-magic-sparkles"></i> 役の魔法シミュレーター</h3>
            <p>「揃っているのにあがれない」理由を目で確認しましょう。</p>
            <div id="sim-hand" class="hand-display">
                </div>
            <div style="text-align: center; margin-top: 1rem;">
                <button id="btn-no-yaku" class="nav-btn active">役なし（あがれない）</button>
                <button id="btn-with-yaku" class="nav-btn">タンヤオ成立（あがれる！）</button>
            </div>
            <p id="sim-desc" style="font-size: 0.9rem; text-align: center; margin-top: 1rem; color: var(--clr-main); font-weight: bold;">
                残念！1と9が混じっているので、役がありません。
            </p>
        </div>
    `;
    simulatorArea.insertAdjacentHTML('beforeend', simHTML);

    const handContainer = document.querySelector('#sim-hand');
    const desc = document.querySelector('#sim-desc');
    const btnNo = document.querySelector('#btn-no-yaku');
    const btnWith = document.querySelector('#btn-with-yaku');

    const renderHand = (isYaku) => {
        const tiles = isYaku 
            ? ['man2','man3','man4','pin5','pin5','pin5','sou6','sou7','sou8','man4','man4'] // タンヤオ
            : ['man1','man2','man3','pin5','pin5','pin5','sou6','sou7','sou8','man4','man4']; // 1が含まれる
        
        handContainer.innerHTML = tiles.map(t => {
            const suit = t.replace(/[0-9]/g, '');
            const num = t.replace(/[^0-9]/g, '');
            return `<div class="tile ${suit}"><span class="tile-label">${suit}</span>${num}</div>`;
        }).join('');
    };

    btnNo.addEventListener('click', () => {
        renderHand(false);
        desc.innerText = "× 1が含まれているので「タンヤオ」になりません。";
        btnNo.classList.add('active');
        btnWith.classList.remove('active');
    });

    btnWith.addEventListener('click', () => {
        renderHand(true);
        desc.innerText = "○ 2〜8だけで構成されたので「タンヤオ」が成立！ロンできます！";
        btnWith.classList.add('active');
        btnNo.classList.remove('active');
    });

    renderHand(false); // 初回表示
}

/**
 * 画面上部のプログレスバー
 */
function initProgressBar() {
    const bar = document.createElement('div');
    bar.style.position = 'fixed';
    bar.style.top = '0';
    bar.style.left = '0';
    bar.style.height = '4px';
    bar.style.background = 'var(--clr-accent)';
    bar.style.zIndex = '2000';
    bar.style.transition = 'width 0.2s ease';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        bar.style.width = scrolled + "%";
    });
}

/**
 * オリジナル通知（トースト）
 */
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--clr-main)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '50px',
        boxShadow: 'var(--shadow-md)',
        zIndex: '3000',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.style.opacity = '1', 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
