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
  const tableBody = document.getElementById('liver-table-body');

  //tablebodyが見つからない場合は処理を中断
  if (!tableBody) return;

  try {
    //Firestoreからliversコレクションを取得
    const querySnapshot = await getDocs(collection(db, "livers"));

    //取得したデータをhtmlに変換
    let htmlContent = '';
    querySnapshot.forEach((doc) => {
      const liver = doc.data();
      htmlContent += `
        <tr>
            <td>${liver.name}</td>
            <td>${"準備中"}</td>
            <td><span style="color: #27ae60;">● 利用可能</span></td>
            <td>
                <a href="assets.html?liver=${liver.name}&id=${liver.id}" class="btn-live2d">Live2D設定</a>
                <button onclick="deleteLiver('${liver.name}','${liver.id}')">削除</button>
            </td>
        </tr>`;
    });

    //テーブルに流し込む
    tableBody.innerHTML = htmlContent || '<tr><td colspan="4">ライバーが登録されていません</td></tr>';
  } catch (e) {
    console.error("データ取得エラー:", e);
    tableBody.innerHTML = '<tr><td colspan="4">読み込みエラーが発生しました</td></tr>';
  }
});

async function addLiver(name) {
  if (!name) return alert("追加するライバー名を入力してください");

  try {
    const liverId = crypto.randomUUID();
    await setDoc(doc(db, "livers", liverId), {
      id: liverId,
      name: name,
      createdAt: serverTimestamp()
    });
    alert(`${name} さんを登録しました！`);

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

async function deleteLiver(name,id) {
  
  if(!window.confirm(`${name} さんを削除します。本当によろしいですか？`)){
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