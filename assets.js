// assets.js

// 練習用モデルの設計図ファイルをURLから引用
const MODEL_URL = "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/hiyori/hiyori_v8.model3.json";
// キー名を統一
const STORAGE_KEY = 'live2d_models';

const assetForm = document.getElementById('asset-form');
const listItems = document.getElementById('list-items');

// --- READ (一覧表示) ---
function loadModels() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!listItems) return; // list-itemsがない画面でのエラー防止

    listItems.innerHTML = '';
    data.forEach((model, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${model.name}</span>
            <button onclick="deleteModel(event, ${index})">削除</button>
        `;
        li.onclick = () => console.log("選択:", model);
        listItems.appendChild(li);
    });
}

// --- CREATE (登録) ---
assetForm.addEventListener('submit', (e) => {
    e.preventDefault(); // <form>リロード停止

    const nameInput = assetForm.querySelector('input[type="text"]');
    const newModelName = nameInput.value.trim();    // 空白を除去

    // 名前が入っていない場合は警告を出して中断
    if (!newModelName) {
        alert("[エラー]衣装名を入力してください");
        nameInput.focus();    // 入力欄にカーソルを合わせる
        return;
    }
    // 名前の長さが21文字を超過している場合は警告を出して中断
    if (newModelName.length > 20) {
        alert("[エラー]衣装名は20文字以内で入力してください");
        return;
    }

    // 既存のリストを取得（STORAGE_KEYを使用）
    const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // 新しい衣装データを追加
    currentData.push({
        name: newModelName,
        status: '有効',
        date: new Date().toLocaleDateString()
    });

    // 保存
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
        alert('設定を保存しました。管理画面に戻ります。');
        //追加後衣装権限管理画面へ遷移
        window.location.href = 'permissions.html';
    } catch (error) {
        console.error("保存失敗:", error);
        alert("ブラウザの保存容量がいっぱいです。不要なデータを削除してください。");
    }
});

// --- DELETE (削除) ---
window.deleteModel = (event, index) => {
    event.stopPropagation(); // 親のliクリックイベント（プレビュー等）が動かないようにする
    if (!confirm('本当に削除しますか？')) return;
    alert('設定を保存しました。管理画面に戻ります。');
    //削除後衣装権限管理画面へ遷移
    window.location.href = 'permissions.html';

    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    data.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    loadModels();
};

loadModels();

// Live2Dモデルを表示する関数
async function initLive2D() {
    try {
        const app = new PIXI.Application({
            view: document.getElementById('live2d-canvas'),
            autoStart: true,
            resizeTo: document.querySelector('.preview-section'), // プレビューエリアに合わせる
            transparent: true, // 背景を透明に
            backgroundAlpha: 0,//WebGLエラー対策
            antialias: true,
            resolution: window.devicePixelRatio || 1
        });

        // モデルを読み込む
        const model = await PIXI.live2d.Live2DModel.from(MODEL_URL);

        // モデルを画面に追加
        app.stage.addChild(model);

        // 大きさと位置の調整
        model.scale.set(0.1); // 10%のサイズに...（ひよりちゃんは元が大きいため）
        model.x = 0;
        model.y = 0;

        // ドラッグで動かせるようにする
        model.on('hit', (hitAreas) => {
            if (hitAreas.includes('body')) {
                model.motion('TapBody'); // 体を叩くと動く
            }
        });

    } catch (e) {
        console.error("Live2Dの初期化中にエラーが発生しました:", e);
    }
}

//実行
initLive2D();
