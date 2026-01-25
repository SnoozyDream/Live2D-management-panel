// storage.js データ管理担当

const STORAGE_KEY = 'live2d_models';
const SELECTED_KEY = 'selected_liver_model';

// ライバーとモデルの対応表
const LIVER_MODELS = {
    'kohaku': './models/hiyori/hiyori_free_t08.model3.json',
    'Mao': './models/mao_model/model.json', 
    'ゲスト': './models/hiyori/hiyori_free_t08.model3.json'
};

// --- 関数: ライバー名からモデルのパスを返す ---
function getModelPath(name) {
    return LIVER_MODELS[name] || LIVER_MODELS['ゲスト'];
}

// --- 関数: 全データを取得する ---
function getSavedModels() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// --- 関数: 新しい衣装を保存する ---
function saveModel(newModel) {
    const data = getSavedModels();
    data.push(newModel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- 関数: 特定の衣装を削除する ---
function deleteModelData(targetItem) {
    const allData = getSavedModels();
    // ターゲット（ライバー名と衣装名の組み合わせ）が一致しないものだけ残す
    const newData = allData.filter(item => 
        !(item.liver === targetItem.liver && item.name === targetItem.name)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
}

// 今どの衣装を選択しているかを保存
function setSelectedModel(modelName) {
    localStorage.setItem(SELECTED_KEY, modelName);
}

function getSelectedModel() {
    return localStorage.getItem(SELECTED_KEY) || "デフォルト";
}