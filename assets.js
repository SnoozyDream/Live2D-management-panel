
const STORAGE_KEY = 'live2d_models';


const assetForm = document.getElementById('asset-form');
const listItems = document.getElementById('list-items');
const dropZone = document.getElementById('drop-zone');

function loadModels() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    listItems.innerHTML = ''; 
    data.forEach((model, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${model.name}</span>
            <button onclick="deleteModel(${index})">削除</button>
        `;
        li.onclick = () => selectModel(model); 
        listItems.appendChild(li);
    });
}


assetForm.addEventListener('submit', (e) => {
    e.preventDefault();//<form>のリロードを止める
    
    const nameInput = assetForm.querySelector('input[type="text"]');
    const newModelName = nameInput.value;

    //既存の衣装リストを取得（共通のキーを使用する）
    const storagekey = 'costum_list';
    const currentData = JSON.parse(localStorage.getItem(storageKey) || '[]');

    //新しい衣装データを追加
    currentData.push({
        name: newModelName,
        status:'有効',
        date: new Date().toLocaleDateString()
    });

    //保存
    localStorage.setItem(storageKey,JSON.stringify(currentData));

    alert('設定を保存しました。管理画面に戻ります。');

    //元の画面(衣装権限管理画面)へ遷移
    window.location.href = 'permissions.html';
});


window.deleteModel = (index) => {
    if (!confirm('本当に削除しますか？')) return;
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    data.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    loadModels();
};


loadModels();
