//permissions.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async function () {
  const gridContainer = document.getElementById('liver-grid-container');
  if (!gridContainer) return;

  try {
    // 全ライバーを取得
    const querySnapshot = await getDocs(collection(db, "livers"));

    // 衣装データを取得（outfitsコレクションを指定）
    const outfitsSnapshot = await getDocs(collection(db, "outfits"));
    const allOutfits = [];
    outfitsSnapshot.forEach(doc => allOutfits.push(doc.data()));

    let htmlContent = '';

    // ライバーごとにループしてHTMLを作成
    for (const liverDoc of querySnapshot.docs) {
      const liver = liverDoc.data();

      // このライバーの名前(liver.liverName)と、衣装データの(outfit.liverName)を紐付け
      const myAssets = allOutfits
        .filter(outfit => outfit.liveName === liver.liverName)
        .map(outfit => outfit.liverName);


      // バッジの判定（myAssetsの中身があるかどうかで色と文字を変える）
      const statusLabel = myAssets.length > 0 ? '● 利用可能' : '○ 衣装なし';
      const statusClass = myAssets.length > 0 ? 'status-online' : 'status-offline';

      const assetsText = myAssets.length > 0 ? myAssets.join(', ') : 'なし';

      htmlContent += `
        <div class="liver-card">
            <div class="status-badge ${statusClass} ">${statusLabel}</div>
            <h3>${liver.liverName}</h3>
            console.log("今のライバーデータ:", liver);
            <div class="info">
                <p>所有衣装: <strong>${assetsText}</strong></p> 
                <p style="font-size: 0.8rem; color: #888;">ID: ${liver.id ? liver.id.substring(0, 8) : 'unknown'}...</p>
            </div>
            <div class="actions">
                <a href="assets.html?liver=${liver.liverName}&id=${liver.id}" class="btn-live2d" style="flex: 1; text-decoration: none; text-align: center; line-height: 40px;">Live2D設定</a>
                <button class="delete-btn" onclick="deleteLiver('${liver.liverName}','${liver.id}')" style="flex: 0 0 auto;">削除</button>
            </div>
        </div>`;
    }

    gridContainer.innerHTML = htmlContent || '<p style="grid-column: 1/-1; text-align: center;">ライバーが登録されていません</p>';
  } catch (e) {
    // コンソールに詳細なエラーを出して原因を特定しやすくする
    console.error("Firebaseデータ取得エラーの詳細:", e);
    gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">読み込みエラーが発生しました<br><span style="font-size:0.8rem; color:red;">${e.message}</span></p>`;
  }
});

async function addLiver(liverName) {
  if (!liverName) return alert("追加するライバー名を入力してください");

  try {
    const liverId = crypto.randomUUID();
    await setDoc(doc(db, "livers", liverId), {
      id: liverId,
      liverName: liverName,
      createdAt: serverTimestamp()
    });
    alert(`${liverName} さんを登録しました！`);

    const inputField = document.getElementById('new-liver-name');
    if (inputField) inputField.value = '';

    location.reload(); //登録したら画面を更新
  } catch (e) {
    console.error("登録エラー:", e);
    alert("登録に失敗しました");
  }
}

// ボタンから呼び出せるように公開する
window.addLiver = addLiver;

async function deleteLiver(name, id) {

  if (!window.confirm(`${name} さんを削除します。本当によろしいですか？`)) {
    return; // キャンセルされたらここで処理を終了
  }

  try {
    await deleteDoc(doc(db, "livers", id));
    alert("削除が完了しました。");
    location.reload(); //削除したら画面を更新
  } catch (e) {
    console.error("削除エラー:", e);
    alert("削除に失敗しました");
  }
}

window.deleteLiver = deleteLiver;