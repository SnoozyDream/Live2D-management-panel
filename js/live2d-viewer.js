// live2d-viewer.js - キャンバスにモデルを描画

let currentApp = null;  // 既存のアプリを管理するための変数
let isLoading = false;  // 読み込み中フラグ

async function initLive2D(canvasId, modelUrl) {
    if (isLoading) return; 

    try {
        const check = await fetch(modelUrl, { method: 'HEAD' });
        if (!check.ok) {
            alert(`モデルデータが見つかりませんでした。\nパス: ${modelUrl}`);
            return; // 描画処理を中止
        }
    } catch (e) {
        alert("通信エラーまたはファイルへのアクセスが拒否されました。");
        return;
    }

    isLoading = true;

    const container = document.querySelector('.preview-section')
    if(!container) return;

    // 既存のPIXIアプリがあればリソース開放
    if (currentApp) {
        try {
            // 既存のアプリを停止して破棄
            currentApp.stop();
    
            // リソースを解放
            currentApp.destroy(true, { 
                children: true, 
                texture: true, 
                baseTexture: true 
            });
            currentApp = null; // 変数をクリア
            
        } catch (e) {
            console.warn("既存アプリの破棄中にエラー（無視してOK）:", e);
        }
    }

    //キャンパスを真っ新にして作り直す
    container.innerHTML = `<canvas id="${canvasId}"></canvas>`; // 既存の内容をクリア
    const canvas = document.getElementById(canvasId); // 新しいキャンバスを取得

    const drp = Math.min(window.devicePixelRatio || 1, 1.5);

    // PIXIアプリの初期化
    const app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        resizeTo: container,  // 親要素に合わせる
        backgroundColor: 0xeeeeee,
        antialias: true,
        resolution: drp,   // デバイスピクセル比を考慮
        autoDensity: true,
        powerPreference: 'high-performance' // パフォーマンス優先
    });
    currentApp = app;  // 新しいアプリを保存

    try {
        // 引数でもらった modelUrl を読み込む
        const model = await PIXI.live2d.Live2DModel.from(modelUrl);
        
        // モデルの配置とサイズを調整する関数
        const adjustModel = () => {

            // モデルがまだ準備できていなければ何もしない
            if (!model || !app.stage || !app.renderer) return; // app.stageの存在確認を追加

            // setTimeoutで非同期に実行
            setTimeout(() => {
            const w = container.clientWidth; // 親要素の幅
            const h = container.clientHeight; // 親要素の高さ

            app.renderer.resize(w, h); // 一旦リサイズしてから計算
            
            const mWidth = (model.internalModel?.sourceCapsule?.width) || model.width || 100 // デフォルト幅100を設定
            const mHeight = (model.internalModel?.sourceCapsule?.height) || model.height || 100; // デフォルト高さ100を設定

            // 比率計算
            const ratioW = (w * 0.8) / Math.max(mWidth, 1); // 幅の80%に収める
            const ratioH = (h * 0.8) / Math.max(mHeight, 1); // 高さの80%に収める
            const finalRatio = Math.min(ratioW, ratioH); // 最終的なスケールと配置

            // スケールを適用
            model.scale.set(finalRatio); // 均等スケール
            model.anchor.set(0.5, 1.0); // アンカーを足元中央(0.5, 1.0)に設定
            
            // 画面の中央下部に配置
            model.x = w / 2; // 横中央
            model.y = h * 0.95; // 画面下部（少し上げる）
            }, 100); // 少し遅延させてから実行
        };
        
        adjustModel();// 初回配置

        app.stage.addChild(model);  // ステージに追加する前にモデルを準備
        
        window.addEventListener('resize', adjustModel); // 画面サイズが変わった時に再配置を実行

        // インタラクション
        model.on('hit', (hitAreas) => {
            if (hitAreas.includes('body')) {
                model.motion('TapBody');
            }
        });

        console.log("Live2D描画成功:", modelUrl);
    } catch (error) {
        console.error("モデル読み込み失敗:", error);
    } finally {
        isLoading = false; //終わったらフラグを戻す
    }
}