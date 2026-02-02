// assets.js

// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    const selectedId = getSelectedModel(); // 選択中の衣装IDを取得

    let path;

    // 選択中のIDが "デフォルト" でないなら、FirebaseからURLを取る
    if (selectedId && selectedId !== 'デフォルト') {
        try {
            const docSnap = await getDocs(doc(db, 'outfits', selectedId));

            if (docSnap.exists()) {
                // 登録した衣装がある場合
                path = selectedOutfit.modelURL;
                console.log(`${currentLiver}が衣装を着用中`, docSnap.data().name);
            }
        } catch (e) {
            console.error("表示更新エラー: ", e);
        }
    }

    // Firebaseにデータがない、またはデフォルトの場合は元のパスを使う
    if (!path) {
        path = getModelPath(currentLiver);
        console.log(`${currentLiver}がデフォルト衣装を着用中`);
    }
    initLive2D('live2d-canvas', path);
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

        const querySnapshot = await getDocs(q); // クエリの実行
        const myData = []; // データ格納用配列

        // 取得したドキュメントを配列に変換
        querySnapshot.forEach((doc) => {
            myData.push({ id: doc.id, ...doc.data() }); // FirebaseのIDをidとして含めてスプレッド構文にして配列にする
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
            if (!response.ok) { throw new Error(); }
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

    const docSnap = await getDocs(doc(db, 'outfits', id));
    try {
        const target = docSnap.data();

        if (docSnap.exists()) {
            setSelectedModel(id);
            alert(`${target.name} に着替えました！`);

            loadModels(); // リストのハイライト更新
            refreshDisplay(); // Live2D再描画
        }
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
        loadModels(); // 一覧を再表示

        // 選択中の衣装が削除された場合、選択を解除してデフォルト衣装に戻す
        const selectedId = getSelectedModel();
        if (selectedId === id) {
            localStorage.removeItem('selectedModel'); // 選択解除
            refreshDisplay();
        }
    } catch (e) {
        console.error("Firebase削除エラー: ", e);
        alert('削除に失敗しました。時間を置くか、設定を確認してください。');
    }
};