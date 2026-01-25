// live2d-viewer.js キャンパスにモデルを描画

// Live2Dモデルを表示する関数
async function initLive2D() {
    const canvas = document.getElementById('live2d-canvas');
    if (!canvas) console.error("キャンバスが見つかりません！"); return;
        
    //キャンパスの用意
    const app = new PIXI.Application({
        view: canvas, // HTMLのCanvasと紐付け
        autoStart: true,
        resizeTo: document.querySelector('.preview-section'),
        backgroundColor: 0xeeeeee,
    });

        console.log("PIXI APP 作成完了：", app);

    try {
        //Live2Dモデルの読み込み
        const model = await PIXI.live2d.Live2DModel.from(MODEL_URL);
        
        app.stage.addChild(model);
        model.x = app.screen.width / 2;
        model.y = app.screen.height / 2;
        model.anchor.set(0.5, 0.5); // 中心点をモデルの真ん中に
        model.scale.set(0.2); // 最初は小さめに表示して映るか確認

        console.log("モデルの読み込みに成功しました！");
        
        // インタラクション設定
        model.on('hit', (hitAreas) => {
            if (hitAreas.includes('body')) {
                model.motion('TapBody'); // 体を叩くと動く
            }
        });
    } catch (error) {
        console.error("モデルの読み込みに失敗しました", error);
    }
}