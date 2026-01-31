// live2d-viewer.js - キャンバスにモデルを描画

let currentApp = null;  // 既存のアプリを管理するための変数

async function initLive2D(canvasId, modelUrl) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error("キャンバスが見つかりません！");
        return;
    }

    // 既存のPIXIアプリがあればリソース開放
    if (currentApp) {
        // 既存のアプリを停止して破棄
        currentApp.stop();

        // リソースを解放
        currentApp.destroy(true, { 
            children: true, 
            texture: true, 
            baseTexture: true 
        });
        currentApp = null; // 変数をクリア
    }

    // PIXIアプリの初期化
    const app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        resizeTo: document.querySelector('.preview-section'),
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
            if (!model) return;

            //sourceCapsule が取得できない場合を想定して、model.width/height をバックアップとして使用
            const mWidth = (model.internalModel?.sourceCapsule?.width)
             || model.width
             || 100; // デフォルト幅100を設定

            const mHeight = (model.internalModel?.sourceCapsule?.height)
             || model.height
             || 100; // デフォルト高さ100を設定

             // 画面サイズ (app.screen) が取得できない場合への対策
            const screenW = app.screen?.width || window.innerWidth;
            const screenH = app.screen?.height || window.innerHeight;

            // 比率計算 (0除算を防ぐため、念のためWidth/mHeightが0でないことも考慮)
            const ratioW = (app.screen.width * 0.8) / Math.max(mWidth,1);
            const ratioH = (app.screen.height * 0.8) / Math.max(mHeight,1);
            
            // 最終的なスケールと配置
            const finalRatio = Math.min(ratioW, ratioH);
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
    }
}