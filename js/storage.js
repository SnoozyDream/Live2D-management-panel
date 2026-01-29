// storage.js データ管理担当

const STORAGE_KEY = 'live2d_models';
const SELECTED_KEY = 'selected_liver_model';

// ライバーとモデルの対応表
const LIVER_MODELS = {
    'hiyori': './models/hiyori/hiyori_free_t08.model3.json',
    'miku': './models/miku/miku.model3.json', 
    'ゲスト': './models/hiyori/hiyori_free_t08.model3.json'
};

// --- 関数: ライバー名からモデルのパスを返す ---
window.getModelPath = function(name) {
    return LIVER_MODELS[name] || LIVER_MODELS['ゲスト'];
}

// --- 関数: 全データを取得する ---
window.getSavedModels = async function() {
    // 実際にはここで fetch('/api/models') などをする
    return new Promise((resolve) => {
        setTimeout(() => { // 擬似的な非同期処理
            const data = localStorage.getItem(STORAGE_KEY);
            resolve(data ? JSON.parse(data) : []);
        }, 100); // 100msの遅延
    });
}

// --- 関数: 新しい衣装を保存する ---
window.saveModel = async function(newModel) {
    const data = await window.getSavedModels(); // 非同期で取得
    data.push(newModel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("DB(Local)に保存完了:", data);
};

// --- 関数: 特定の衣装を削除する ---
window.deleteModelData = async function(targetItem) {
    const allData = await getSavedModels();
    // ターゲット（ライバー名と衣装名の組み合わせ）が一致しないものだけ残す
    const newData = allData.filter(item => 
        !(item.liver === targetItem.liver && item.name === targetItem.name)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
}

// --- (setter) 今どの衣装を選択しているかを保存 ---
function setSelectedModel(modelName) {
    localStorage.setItem(SELECTED_KEY, modelName);
}

// --- (getter) 選択されている衣装名を取得 ---
function getSelectedModel() {
    return localStorage.getItem(SELECTED_KEY) || "デフォルト";
}