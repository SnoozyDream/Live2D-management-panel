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
async function loadModels() {
    const listItems = document.getElementById('list-items');
    if (!listItems) return;

    // 現在のリストをクリアしてから再構築
    const myData = await getSavedModels();
    const filteredData = myData.filter(item => item.liver === currentLiver);
    
    const currentActive = getSelectedModel();

    listItems.innerHTML = filteredData.map((model, index) => `
        <li onclick="changeClothes('${model.name}')" style="cursor:pointer; ${model.name === currentActive ? 'background:#d1e7ff;' : ''}">
            <span>${model.name}</span>
            <button onclick="event.stopPropagation(); deleteAction(${index})">削除</button>
        </li>
    `).join('');
}

// --- CREATE: 登録 ---
const assetForm = document.getElementById('asset-form');
if (assetForm) {
    assetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = assetForm.querySelector('input[type="text"]');
        const newName = nameInput.value.trim();

        if (!newName) return alert("衣装名を入力してください");

        // ライバー名が正しく取れているか？
        console.log("現在のライバー:", currentLiver);
        if (!currentLiver || currentLiver === 'ゲスト') {
            const confirmGuest = confirm("ライバー名が『ゲスト』ですが、このまま保存しますか？");
            if (!confirmGuest) return;
        }

        const dataToSave ={
            liver: currentLiver,
            name: newName,
            date: new Date().toLocaleDateString()
        };

        try {
            console.log("保存を開始します", dataToSave);
            await window.saveModel(dataToSave);
            console.log("保存が完了しました");
            
            alert(`${currentLiver}さんの『${newName}』を保存しました！`);

            // URLを強制的に指定して遷移
            const nextUrl = `assets.html?liver=${encodeURIComponent(currentLiver)}`;
            console.log("次のページへ移動します:", nextUrl);
            window.location.href = nextUrl;
        } catch (error) {
            console.error("保存中にエラーが発生しました:", error);
            alert("保存に失敗しました。もう一度お試しください。" + error.message);
        }
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
window.deleteAction = async (index) => {
    if (!confirm('削除しますか？')) return;

    const allData = await getSavedModels();
    const myData = getSavedModels().filter(item => item.liver === currentLiver);
    deleteModelData(myData[index]);

    await deleteModelData(myData[index]);

    alert('削除しました');
    location.reload();
};