// assets.js

import { getModelPath, setSelectedModel, getSelectedModel, getSavedModels } from './storage.js';

// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebaseの設定情報
const firebaseConfig = {
    apiKey: "AIzaSyDlGhC_YV1UkD6jMKJy7fX31LqMYGiheEo",
    authDomain: "live2d-asset-manager.firebaseapp.com",
    projectId: "live2d-asset-manager",
    storageBucket: "live2d-asset-manager.firebasestorage.app",
    messagingSenderId: "459618368641",
    appId: "1:459618368641:web:9e72bbee06bf9ef17c6180",
    measurementId: "G-WBEQYDQX7K"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig); // Firebaseアプリの初期化
const db = getFirestore(app);              // Firestoreデータベースの初期化

const urlParams = new URLSearchParams(window.location.search); // URLパラメータの取得
const currentLiver = urlParams.get('liver') || 'ゲスト';       // ライバー名の取得、なければ'ゲスト'

window.addEventListener('load', () => {
    // タイトル反映
    const titleElement = document.querySelector('h1');
    if (titleElement) titleElement.textContent = `${currentLiver} さんの衣装設定`;

    // 初期表示 (Live2D)
    refreshDisplay();

    // 一覧表示
    loadModels();
});

// 画面とLive2Dを最新状態にする関数
async function refreshDisplay() {
    const selectedId = getSelectedModel(); // 選択中の衣装IDを取得

    // 特殊なIDや空の場合は、即座にデフォルトを表示して終了
    const isSpecialId = !selectedId || ['デフォルト', 'null', 'undefined'].includes(selectedId); // ガード：特殊なIDや空の場合は、即座にデフォルトを表示して終了
    
    // デフォルトモデルの表示
    if (isSpecialId) {
        showDefaultModel();
        return;
    }

    try {
        // Firebaseから選択中の衣装データを取得
        const docSnap = await getDoc(doc(db, 'outfits', selectedId));

        // データが存在しない場合のガード
        if (!docSnap.exists()) { // データが存在しない場合
            console.warn("データがないためリセットします");
            localStorage.removeItem('selected_liver_model');
            showDefaultModel(); // デフォルトモデルの表示
            return;
        }

        // データが存在する場合
        const data = docSnap.data(); // データ取得
        console.log(`${currentLiver}が着用中:`, data.name);
        initLive2D('live2d-canvas', data.modelURL); // Live2D初期化関数にモデルURLを渡す

    } catch (e) {
        console.error("表示更新エラー: ", e);
        showDefaultModel(); // エラー時もデフォルトに逃がす
    }
}

// デフォルトモデルの表示
function showDefaultModel() {
    const path = getModelPath(currentLiver); // デフォルトモデルのパスを取得
    console.log(`${currentLiver}がデフォルト衣装を着用中`);
    initLive2D('live2d-canvas', path); // Live2D初期化関数にデフォルトモデルのパスを渡す
}

// --- READ: 一覧表示 ---
async function loadModels() {
    const listItems = document.getElementById('list-items');
    if (!listItems) return;

    try {

        // クエリの作成: 現在のライバー名に一致するドキュメントを取得し、作成日時でソート
        const q = query(
            collection(db, 'outfits'),
            where("liver", "==", currentLiver),
            orderBy("createdAt", "asc")
        );

        // クエリの実行とデータ取得
        const querySnapshot = await getDocs(q); // クエリの実行
        const currentActive = getSelectedModel(); // 選択中の衣装IDを取得

        const myData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // データ格納配列

        listItems.innerHTML = myData.length > 0
            ? myData.map(model => `
                <li onclick="changeClothes('${model.id}')" style="cursor:pointer; ${model.id === currentActive ? 'background:#d1e7ff;' : ''}">
                    <span>${model.name}</span>
                    <button onclick="event.stopPropagation(); deleteAction('${model.id}')">削除</button>
                </li>`).join('')
            : '<li>衣装が登録されていません</li>';

    } catch (e) {
        console.error("Firebase読み込みエラー: ", e);
        alert("クラウドからのデータ取得に失敗しました。時間を置くか、設定を確認してください。")
    }
}

// --- CREATE: 登録 ---
const assetForm = document.getElementById('asset-form');
if (assetForm) {
    assetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameValue = document.getElementById('outfit-name').value;
        const urlValue = document.getElementById('model-url').value;

        // 必須項目のチェック
        if (!nameValue || !urlValue) return alert("登録に必要な項目の入力が足りません。入力してください");

        console.log("今保存しようとしているライバー名:", currentLiver);

        // パスの生存確認
        try {
            const response = await fetch(urlValue, { method: 'HEAD' }); // HEADリクエストで存在確認
            if (!response.ok) { throw new Error(); }
        } catch (e) {
            alert("指定されたモデルのパスが見つかりません。パスが正しいか、ファイルが配置されているか確認してください。");
            return;
        }

        // 保存データの構築
        const dataToSave = {
            //id: newId,            //　Firebase側で自動生成
            liver: currentLiver,    //どのライバーのデータか
            name: nameValue,        //衣装名
            modelURL: urlValue,     //モデルデータ
            createdAt: new Date()   //作成日時
        };

        try {
            await addDoc(collection(db, 'outfits'), dataToSave); //DBは、firebase.jsで初期化済みのdbを使用
            alert(`「${nameValue}」を登録しました！`);

            // URLを強制的に指定してリロード
            window.location.href = `assets.html?liver=${encodeURIComponent(currentLiver)}`;
        } catch (e) {
            console.error("Firebase保存エラー: ", e);
            alert("クラウドへの保存に失敗しました。時間を置くか、設定を確認してください。")
        }
    });
}

// --- UPDATE (表示切り替え): 衣装選択 ---
window.changeClothes = async (id) => {
    try {
        // Firestoreからデータを取得して存在確認
        const docSnap = await getDoc(doc(db, 'outfits', id));

        // データが存在しない場合のガード処理
        if (!docSnap.exists()) {
            console.warn("対象の衣装が見つかりません:", id);
            return;
        }

        const data = docSnap.data(); // 通知の為のデータ取得

        setSelectedModel(id); // 選択中の衣装IDを保存
        alert(`${data.name} に着替えました！`);

        loadModels(); // リストのハイライト更新
        refreshDisplay(); // Live2D再描画

    } catch (e) {
        console.error("着替えエラー: ", e);
    };
}

// --- DELETE: 削除 ---
window.deleteAction = async (id) => {
    if (!confirm('本当にこの衣装を削除しますか？')) return;

    try {
        // Firestoreからデータを削除
        await deleteDoc(doc(db, 'outfits', id)); // db(初期化済みのインスタンス)、`outfits`(コレクション名)、id(ドキュメントID)を指定して削除
        alert('クラウドから削除が完了しました');

        if (getSelectedModel() === id) {
            setSelectedModel('デフォルト'); // 選択解除
        }
        loadModels();
        refreshDisplay();
    } catch (e) {
        console.error("Firebase削除エラー: ", e);
        alert('削除に失敗しました。時間を置くか、設定を確認してください。');
    }
};