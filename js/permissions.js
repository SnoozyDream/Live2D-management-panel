//permissions.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
                <button type="button">編集</button>
                <a href="assets.html?liver=${liver.name}&id=${liver.id}" class="btn-live2d">Live2D設定</a>
            </td>
        </tr>`;
    });

    //テーブルに流し込む
    tableBody.innerHTML = htmlContent || '<tr><td colspan="4">ライバーが登録されていません</td></tr>';
  } catch (error) {
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
    location.reload(); //登録したら画面を更新
  } catch (e) {
    console.error("登録エラー:", e);
    alert("登録に失敗しました");
  }
}

// ボタンから呼び出せるように公開する
window.addLiver = addLiver;