//permissions.js

const STORAGE_KEY = 'live2d_models';
const tableBody = document.getElementById('liver-table-body');

document.addEventListener('DOMContentLoaded', function () {

  //tablebodyが見つからない場合は処理を中断
  if (!tableBody) return;

  //デフォルトのライバーデータ
  let livers = [
    { name: 'kohaku', costumes: '通常、冬服、部屋着', status: '● 利用可能', color: '#27ae60' },
    { name: 'Mao', costumes: '通常、冬服、部屋着', status: '△ 承認待ち', color: '#f39c12' }
  ];

  //STORAGE_KRYを使ってデータを取得
  const savedModels = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  //保存データがあれば、それぞれに該当するライバーに衣装を追加する
  savedModels.forEach(model => {
    // model.liver（データの持ち主）と一致する人を livers 配列から探す
    const targetLiver = livers.find(l => l.name === model.liver);
    
    // 見つかった場合、その人の衣装にモデル名を追加
    if (targetLiver) {
      // 既存の衣装にカンマ区切りで追加
      targetLiver.costumes += `、` + model.name;
    }
  });

  //テーブルのhtmlを組み立てる
  let htmlContent = '';
  livers.forEach(liver => {
    htmlContent += `
        <tr>
            <td>${liver.name}</td>
            <td>${liver.costumes}</td>
            <td><span style="color: ${liver.color};">${liver.status}</span></td>
            <td>
                <button type="button">編集</button>
                <a href="assets.html?liver=${liver.name}" class="btn-live2d">Live2D設定</a>
            </td>
        </tr>
        `;
  });

  //テーブルに流し込む
  tableBody.innerHTML = htmlContent;
});
