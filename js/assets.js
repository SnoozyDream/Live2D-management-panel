// assets.js - 司令塔

const urlParams = new URLSearchParams(window.location.search);
const currentLiver = urlParams.get('liver') || 'ゲスト';

window.addEventListener('load', () => {
    // 1. タイトル反映
    const titleElement = document.querySelector('h1');
    if (titleElement) titleElement.textContent = `${currentLiver} さんの衣装設定`;

    // 2. 初期表示 (Live2D)
    refreshDisplay();

    // 3. 一覧表示
    loadModels();
});

// 画面とLive2Dを最新状態にする関数
function refreshDisplay() {
    const path = getModelPath(currentLiver);
    const selectedClothes = getSelectedModel();
    
    console.log(`${currentLiver}が ${selectedClothes} を着用中`);
    initLive2D('live2d-canvas', path);
}

// --- READ: 一覧表示 ---
function loadModels() {
    const listItems = document.getElementById('list-items');
    if (!listItems) return;

    const myData = getSavedModels().filter(item => item.liver === currentLiver);
    const currentActive = getSelectedModel();

    listItems.innerHTML = myData.map((model, index) => `
        <li onclick="changeClothes('${model.name}')" style="cursor:pointer; ${model.name === currentActive ? 'background:#d1e7ff;' : ''}">
            <span>${model.name}</span>
            <button onclick="event.stopPropagation(); deleteAction(${index})">削除</button>
        </li>
    `).join('');
}

// --- CREATE: 登録 ---
const assetForm = document.getElementById('asset-form');
if (assetForm) {
    assetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = assetForm.querySelector('input[type="text"]');
        const newName = nameInput.value.trim();

        if (!newName) return alert("衣装名を入力してください");

        const dataToSave ={
            liver: currentLiver,
            name: newName,
            date: new Date().toLocaleDateString()
        };

        alert('保存しました！');
        location.reload(); // 一覧更新のためにリロード
    });
}

// --- UPDATE (表示切り替え): 衣装選択 ---
window.changeClothes = (modelName) => {
    setSelectedModel(modelName);
    alert(`${modelName} に着替えました！`);
    loadModels(); // リストのハイライト更新
    // 本来はここでLive2Dのテクスチャ等を差し替えるが、今はログと再描画で表現
    refreshDisplay();
};

// --- DELETE: 削除 ---
window.deleteAction = (index) => {
    if (!confirm('削除しますか？')) return;

    const myData = getSavedModels().filter(item => item.liver === currentLiver);
    deleteModelData(myData[index]);
    
    alert('削除しました');
    location.reload();
};