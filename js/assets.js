// assets.js

// --- 設定と外部との連携 ---
const urlParams = new URLSearchParams(window.location.search);
const currentLiver = urlParams.get('liver') || 'ゲスト';
const STORAGE_KEY = 'live2d_models';

console.log("現在のターゲット：",currentLiver);

//ページのタイトルを選択したライバー毎に反映させるように表示
const titleElement = document.querySelector('h1');
if (titleElement) {
    titleElement.textContent = `${currentLiver} さんの衣装設定`;
}

// 練習用モデルの設計図ファイルをURLから引用
const MODEL_URL = './models/hiyori/hiyori_free_t08.model3.json';

//状態の確認
console.log("PIXIの状態:", typeof PIXI !== 'undefined' ? "OK" : "未読み込み");
console.log("Live2Dプラグインの状態:", PIXI.live2d ? "OK" : "未読み込み");

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
if (assetForm){
    assetForm.addEventListener('submit', (e) => {
        e.preventDefault(); // <form>リロード停止
    alert('"submit(e) => e.preeventDefault()" :リロード停止処理がされました。');

    const nameInput = assetForm.querySelector('input[type="text"]');
    const newModelName = nameInput.value.trim();    // 空白を除去

    // 名前が入っていない場合は警告を出して中断
    if (!newModelName) {
        alert("[エラー]衣装名を入力してください");
        return;
    }

    // 既存のリストを取得（STORAGE_KEYを使用）
    let currentData = [];
    alert("既存の衣装リストを取得しました。");
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        //データが存在かつ配列の型をしていれば処理
        const parsedData = JSON.parse(savedData);
        if (Array.isArray(parsedData)) {
            currentData = parsedData;
        }
    } catch (error) {
        console.warn("既存データの解析に失敗した為、リセットしました");
        currentData = [];
    }

    // 新しい衣装データを追加
    console.log("push直前のデータ状態:", currentData);

    currentData.push({
        liver:currentLiver, //追加するライバーを特定
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
}

// --- DELETE (削除) ---
window.deleteModel = (event, index) => {
    event.stopPropagation(); // 背景のクリックイベントを防ぐ

    //ユーザーに最終確認を取る
    if (!confirm('本当に削除しますか？\n削除後は元に戻せません。')) return;

    //データを削除
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    data.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    alert('削除が完了しました。管理画面の一覧を更新します。');

    //削除後衣装権限管理画面へ遷移
    window.location.href = 'permissions.html';
};

loadModels();

// モデルのパスを決める処理
let modelPath = './models/hiyori/hiyori_free_t08.model3.json'; // デフォルト

if (currentLiver === 'Mao') {
    modelPath = './models/mao/model.json'; // Maoさんのパス
} else if (currentLiver === 'kohaku') {
    modelPath = './models/hiyori/hiyori_free_t08.model3.json';
}

// 引っ越した関数を呼び出す
initLive2D('live2d-canvas', modelPath);

//画面の準備が全て終わってから実行する
window.addEventListener('load',() => {
    initLive2D();
});
