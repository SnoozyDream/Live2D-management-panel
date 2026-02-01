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
async function refreshDisplay() {
    // 保存されている全データを取得
    const allData = await getSavedModels();

    // 選択中の衣装IDを取得
    const selectedId = getSelectedModel();

    // 選択中のIDに一致かつ、現在のライバー名に一致する衣装データを探す
    const selectedOutfit = allData.find(
        item => item.id === selectedId && item.liver === currentLiver
    );

    let path;
    if (selectedOutfit) {
        // 登録した衣装がある場合
        path = selectedOutfit.modelURL;
        console.log(`${currentLiver}が登録衣装 [${selectedOutfit.name}] を着用中`);
    } else {
        // 登録衣装が無い、または未選択の場合はデフォルトモデルのパスを取得
        path = getModelPath(currentLiver);
        console.log(`${currentLiver}がデフォルト衣装を着用中`);
    }

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

    listItems.innerHTML = filteredData.map((model) => `
        <li onclick="changeClothes('${model.id}')" style="cursor:pointer; ${model.id === currentActive ? 'background:#d1e7ff;' : ''}">
            <span>${model.name}</span>
            <button onclick="event.stopPropagation(); deleteAction('${model.id}')">削除</button>
        </li>
    `).join('');
}

// --- CREATE: 登録 ---
const assetForm = document.getElementById('asset-form');
if (assetForm) {
    assetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameValue = document.getElementById('outfit-name').value;
        const urlValue = document.getElementById('model-url').value;

        if (!nameValue || !urlValue) return alert("登録に必要な項目の入力が足りません。入力してください");

        console.log("今保存しようとしているライバー名:", currentLiver);

        // パスの生存確認
        try {
            const response = await fetch(urlValue, { method: 'HEAD' }); // HEADリクエストで存在確認
            if (!response.ok) {
                throw new Error();
            }
        } catch (e) {
            alert("指定されたモデルのパスが見つかりません。パスが正しいか、ファイルが配置されているか確認してください。");
            return; // 登録を中断
        }

        // 現在の全データを取得する();
        const allData = await getSavedModels();

        // 重複しないIDが決まるまでループする
        let newId = crypto.randomUUID();

        // 「もし newId が既存データのどれかの id と一致してしまったら」ループを回す
        while (allData.some(item => item.id === newId)) {
            console.warn("奇跡的な確率でIDが重複しました。再生成します...");
            newId = crypto.randomUUID(); // 再生成して、再度while条件をチェック
        }

        const dataToSave = {
            id: newId, //　一意の衣装IDとしてUUIDを使用
            liver: currentLiver, //どのライバーのデータか
            name: nameValue, //衣装名
            modelURL: urlValue, //モデルデータ
            date: new Date().toLocaleDateString()
        };

        await window.saveModel(dataToSave);
        alert(`衣装セットを登録しました！`);

        // URLを強制的に指定して遷移
        window.location.href = `assets.html?liver=${encodeURIComponent(currentLiver)}`;
    });
}

// --- UPDATE (表示切り替え): 衣装選択 ---
window.changeClothes = async (id) => {

    //全データを取得
    const allData = await getSavedModels();
    //IDが一致する「消したいデータ」を特定
    const target = allData.find(item => item.id === id);

    setSelectedModel(id);
    alert(`${target.name} に着替えました！`);

    // リストのハイライト更新
    loadModels();

    // 古いリソースを解放し、新しいモデルURLでLive2Dを再描画する
    refreshDisplay();
};

// --- DELETE: 削除 ---
window.deleteAction = async (id) => {
    if (!confirm('ほんとにこの衣装を削除しますか？')) return;

    //全データを取得
    const allData = await getSavedModels();
    //IDが一致する「消したいデータ」を特定
    const target = allData.find(item => item.id === id);

    if (target) {
        // storage.js などの削除関数を呼ぶ
        await window.deleteModelData(target);
        alert('削除が完了しました');
        location.reload();
    } else {
        alert('エラー：削除対象が見つかりません');
    }
};