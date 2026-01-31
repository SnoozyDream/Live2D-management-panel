// live2d-viewer.js - キャンバスにモデルを描画

let currentApp = null;  // 既存のアプリを管理するための変数
let isLoading = false;  // 読み込み中フラグ

async function initLive2D(canvasId, modelUrl) {
    if (isLoading) return; 
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

    // PIXIアプリの初期化
    const app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        resizeTo: container,  // 親要素に合わせる
        backgroundColor: 0xeeeeee,
        antiailias: true,
        resolution: window.devicePixelRatio || 1,   // 高解像度ディスプレイ対応
        autoDensity: true,
    });
    currentApp = app;  // 新しいアプリを保存

    try {
        // 引数でもらった modelUrl を読み込む
        const model = await PIXI.live2d.Live2DModel.from(modelUrl);
        
        // モデルの配置とサイズを調整する関数
        const adjustModel = () => {
            // モデルがまだ準備できていなければ何もしない
            if (!model || !app.stage) return; // app.stageの存在確認を追加

            //sourceCapsule が取得できない場合を想定して、model.width/height をバックアップとして使用
            const mWidth = (model.internalModel?.sourceCapsule?.width)
             || model.width
             || 100; // デフォルト幅100を設定

            const mHeight = (model.internalModel?.sourceCapsule?.height)
             || model.height
             || 100; // デフォルト高さ100を設定

            // 画面サイズ (app.screen) が取得できない場合への対策
            const screenW = app.screen?.width || 300;
            const screenH = app.screen?.height || 400;

            // 比率計算 (0除算を防ぐため、念のためWidth/mHeightが0でないことも考慮)
            const ratioW = (app.screen.width * 0.8) / Math.max(mWidth,1);
            const ratioH = (app.screen.height * 0.8) / Math.max(mHeight,1);
            
            // 最終的なスケールと配置
            const finalRatio = Math.min(ratioW, ratioH);

            // スケールを適用
            model.scale.set(finalRatio);
            
            // アンカーを足元中央(0.5, 1.0)に設定
            model.anchor.set(0.5, 1.0);
            
            // 画面の中央下部に配置
            model.x = screenW / 2;
            model.y = screenH * 0.95; 
        };
        
        // 初回配置
        adjustModel();

        // ステージに追加する前にモデルを準備
        app.stage.addChild(model);
        
        // 画面サイズが変わった時に再配置を実行
        app.renderer.on('resize', adjustModel);

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