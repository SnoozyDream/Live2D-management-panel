// assets.js

// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

    try{
        // クエリの作成: 現在のライバー名に一致するドキュメントを取得し、作成日時でソート
        const q = query(
            collection(db, 'outfits'),
            where("liver", "==", currentLiver),
            orderBy("createdAt", "asc")
        );
        
        const querySnapshot = await getDocs(q); // クエリの実行
        const myData = []; // データ格納用配列

        // 取得したドキュメントを配列に変換
        querySnapshot.forEach((doc) => {
            myData.push({ id: doc.id, ...doc.data() } ); // FirebaseのIDをidとして含めてスプレッド構文にして配列にする
        });

        const currentActive = getSelectedModel();
        
        listItems.innerHTML = myData.map((model) => `
            <li onclick="changeClothes('${model.id}')" style="cursor:pointer; ${model.id === currentActive ? 'background:#d1e7ff;' : ''}">
                <span>${model.name}</span>
                <button onclick="event.stopPropagation(); deleteAction('${model.id}')">削除</button>
            </li>
        `).join('');
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
            if (!response.ok) { throw new Error();}
        } catch (e) {
            alert("指定されたモデルのパスが見つかりません。パスが正しいか、ファイルが配置されているか確認してください。");
            return; // 登録を中断
        }

        const dataToSave = {
            //id: newId, //　Firebase側で自動生成
            liver: currentLiver, //どのライバーのデータか
            name: nameValue, //衣装名
            modelURL: urlValue, //モデルデータ
            date: new Date().toLocaleDateString(),
            createdAt: new Date()
        };

        try {
        await addDoc(collection(db, 'outfits'), dataToSave); //DBは、firebase.jsで初期化済みのdbを使用
        alert(`【クラウド】衣装セット「${nameValue}」を登録しました！`);

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