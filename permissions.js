  //permissions.js

document.addEventListener('DOMContentLoaded',function() {
    const tableBody = document.getElementById('liver-table-body');
    
    //tablebodyが見つからない場合は処理を中断
    if(!tableBody) return;

  //デフォルトのライバーデータ
  let livers = [
        { name: 'kohaku', costumes: '通常、冬服、部屋着', status: '● 利用可能', color: '#27ae60' },
        { name: 'Mao', costumes: '通常、冬服、部屋着', status: '△ 承認待ち', color: '#f39c12' }
    ];

  //assets.jsで保存したデータを取得(live2d_models)
  const savedModels = JSON.parse(localStorage.geiItem('live2d_models') || '[]');
  
  //保存データがあれば一人目に衣装を追加する
  if (savedModels.length > 0) {
        const newCostumes = savedModels.map(m => m.name).join('、');
        livers[0].costumes += '、${newNames = newCostumes}';
  }

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
                <a href="assets.html" class="btn-live2d">Live2D設定</a>
            </td>
        </tr>
        `;
  });

   //テーブルに流し込む
   tableBody.innerHTML = htmlContent;
  });
