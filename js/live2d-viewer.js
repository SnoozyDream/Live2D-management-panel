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
            // キャンバスの80%に収める計算
            const ratioW = (app.screen.width * 0.8) / model.internalModel.sourceCapsule.width;  // 横幅比率を正確に取得
            const ratioH = (app.screen.height * 0.8) / model.internalModel.sourceCapsule.height;    // 縦幅比率を正確に取得
            
            // 縦横どちらもはみ出さない小さい方の比率を採用
            const finalRatio = Math.min(ratioW, ratioH);
            model.scale.set(finalRatio);
            
            // アンカーを足元中央(0.5, 1.0)に設定
            model.anchor.set(0.5, 1.0);
            
            // 画面の中央下部に配置
            model.x = app.screen.width / 2;
            model.y = app.screen.height * 0.95; 
        };
        
        // 初回配置
        adjustModel();
        
        app.stage.addChild(model);   // ステージに追加する前にモデルを準備
        
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