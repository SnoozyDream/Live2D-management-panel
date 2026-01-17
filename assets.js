
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
    e.preventDefault();
    const nameInput = assetForm.querySelector('input[type="text"]');
    const newModel = {
        name: nameInput.value,
        timestamp: new Date().getTime()
    };

    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    data.push(newModel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    nameInput.value = '';
    loadModels(); 
    alert('モデルを登録しました！');
});


window.deleteModel = (index) => {
    if (!confirm('本当に削除しますか？')) return;
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    data.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    loadModels();
};


loadModels();
