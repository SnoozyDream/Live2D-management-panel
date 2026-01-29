// live2d-viewer.js - キャンバスにモデルを描画

async function initLive2D(canvasId, modelUrl) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error("キャンバスが見つかりません！");
        return;
    }

    // PIXIアプリの初期化
    const app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        resizeTo: document.querySelector('.preview-section'),
        backgroundColor: 0xeeeeee,
    });

    try {
        // 引数でもらった modelUrl を読み込む
        const model = await PIXI.live2d.Live2DModel.from(modelUrl);

        const canvasWidth = app.view.width;
        const canvasHeight = app.view.height;

        const modelWidth = model.width;
        const modelHeight = model.height;
        const ratio = (canvasWidth * 0.8) / modelWidth;

        model.scale.set(ratio);

        model.anchor.set(0.5, 0.5);

        model.x = app.screen.width / 2;
        model.y = app.screen.height / 2;

        app.stage.addChild(model);

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