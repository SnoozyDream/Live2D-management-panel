// storage.js データ管理担当

const SELECTED_KEY = 'selected_liver_model';

// ライバーとモデルの対応表
const LIVER_MODELS = {
    'hiyori': './models/hiyori/hiyori_free_t08.model3.json',
    'miku': './models/miku/miku.model3.json', 
    'ゲスト': './models/hiyori/hiyori_free_t08.model3.json'
};

// --- 関数: ライバー名からモデルのパスを返す ---
export function getModelPath(name) {
    const path = LIVER_MODELS[name];
    if (!path) {
        console.warn(`警告: ${name} のパスが見つからないため、ゲスト用を表示します`);
        return LIVER_MODELS['ゲスト'];
    }
    console.log(`成功: ${name} 用のパス [${path}] を採用しました`);
    return path;
}

// --- (setter) 今どの衣装を選択しているかを保存 ---
// FirebaseのドキュメントIDをLocalStorageにメモする
export function setSelectedModel(modelName) {
    localStorage.setItem(SELECTED_KEY, modelName);
}

// --- (getter) 選択されている衣装名を取得 ---
export function getSelectedModel() {
    return localStorage.getItem(SELECTED_KEY) || "デフォルト";
}

// assets.js 側でまだ呼び出している場合、エラーにならないように中身を空にして残す
export function getSavedModels() {
    return []; // クラウド版ではFirebaseから直接取得するので、ここは常に空
}