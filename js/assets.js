// assets.js
import { getModelPath, setSelectedModel, getSelectedModel } from './storage.js';

// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore, collection, doc, setDoc, getDocs, getDoc,
    query, where, orderBy, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const urlParams = new URLSearchParams(window.location.search);
const currentLiverName = urlParams.get('liver') || 'ゲスト';
const currentLiverId = urlParams.get('id') || 'guest_id';

// --- 初期化処理 ---
window.addEventListener('load', () => {
    const titleElement = document.querySelector('h1');
    if (titleElement) titleElement.textContent = `${currentLiverName} さんの衣装設定`;
    refreshDisplay();
    loadModels();
});

// --- ライバー登録関数 ---
async function registerLiver(liverName) {
    try {
        const liverId = crypto.randomUUID();
        await setDoc(doc(db, "livers", liverId), {
            id: liverId,
            name: liverName,
            createdAt: serverTimestamp(),
            mainOutfitId: null
        });
        console.log("ライバー登録成功:", liverId);
        return liverId;
    } catch (e) { console.error("ライバー登録エラー:", e); }
}

// --- READ: 一覧表示 ---
async function loadModels() {
    const listItems = document.getElementById('list-items');
    if (!listItems) return;

    try {
        const q = query(
            collection(db, 'outfits'),
            where("liverId", "==", currentLiverId), // IDで紐付け
            orderBy("createdAt", "asc")
        );

        const querySnapshot = await getDocs(q);
        const currentActive = getSelectedModel();

        listItems.innerHTML = querySnapshot.empty
            ? '<li>衣装が登録されていません</li>'
            : querySnapshot.docs.map(doc => {
                const data = doc.data();
                return `
                    <li class="model-item" data-id="${doc.id}" style="cursor:pointer; ${doc.id === currentActive ? 'background:#d1e7ff;' : ''}">
                        <span>${data.name}</span> <button class="delete-btn" data-id="${doc.id}">削除</button>
                    </li>`;
            }).join('');

        // リスナー登録
        setupEventListeners(listItems);
    } catch (e) { console.error("Firebase読み込みエラー: ", e); }
}

// --- CREATE: 登録処理 ---
const assetForm = document.getElementById('asset-form');
if (assetForm) {
    assetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameValue = document.getElementById('outfit-name').value;
        const urlValue = document.getElementById('model-url').value;

        if (!nameValue || !urlValue) return alert("入力が足りません");

        try {
            const res = await fetch(urlValue, { method: 'HEAD' });
            if (!res.ok) throw new Error();
        } catch { return alert("モデルのパスが正しくありません"); }

        const outfitId = crypto.randomUUID();
        const dataToSave = {
            id: outfitId,
            liverId: currentLiverId,
            liverName: currentLiverName,
            name: nameValue,
            modelURL: urlValue,
            createdAt: serverTimestamp()
        };

        try {
            await setDoc(doc(db, 'outfits', outfitId), dataToSave);
            alert(`「${nameValue}」を登録しました！`);
            location.reload();
        } catch (e) { console.error("Firebase保存エラー: ", e); }
    });
}

// --- イベントリスナー設定 ---
function setupEventListeners(listItems) {
    listItems.querySelectorAll('.model-item').forEach(item => {
        item.addEventListener('click', () => changeClothes(item.getAttribute('data-id')));
    });

    listItems.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteAction(btn.getAttribute('data-id'));
        });
    });
}

// --- 衣装選択・削除・表示更新ロジック ---
async function changeClothes(id) {
    try {
        const docSnap = await getDoc(doc(db, 'outfits', id));
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        setSelectedModel(id);
        alert(`${data.name} に着替えました！`);
        loadModels();
        refreshDisplay();
    } catch (e) { console.error("着替えエラー:", e); }
}

async function deleteAction(id) {
    if (!confirm('本当に削除します?')) return;
    try {
        await deleteDoc(doc(db, 'outfits', id));
        if (getSelectedModel() === id) setSelectedModel('デフォルト');
        loadModels();
        refreshDisplay();
    } catch (e) { console.error("削除エラー:", e); }
}

async function refreshDisplay() {
    const selectedId = getSelectedModel();
    if (!selectedId || ['デフォルト', 'null', 'undefined'].includes(selectedId)) {
        showDefaultModel();
        return;
    }
    try {
        const docSnap = await getDoc(doc(db, 'outfits', selectedId));
        if (!docSnap.exists()) {
            showDefaultModel();
            return;
        }
        const data = docSnap.data();
        initLive2D('live2d-canvas', data.modelURL);
    } catch (e) { showDefaultModel(); }
}

function showDefaultModel() {
    const path = getModelPath(currentLiverName);
    initLive2D('live2d-canvas', path);
}