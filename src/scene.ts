import { ArcRotateCamera, Color3, HemisphericLight, Scene, Vector3 } from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Camera } from "@babylonjs/core/Cameras/camera";

export function createScene(engine: Engine, canvas: HTMLCanvasElement) {
    const scene = new Scene(engine);
    scene.clearColor = Color3.FromHexString("#0f1116").toColor4(1);

    const camera = new ArcRotateCamera("cam", 0, 0, 30, new Vector3(0, 0, 0), scene);
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    const resizeOrtho = () => {
        const w = engine.getRenderWidth();
        const h = engine.getRenderHeight();
        const aspect = w / h;
        const halfH = 12; // tune to frame 10x22 nicely
        camera.orthoTop = halfH;
        camera.orthoBottom = -halfH;
        camera.orthoLeft = -halfH * aspect;
        camera.orthoRight = halfH * aspect;
    };
    resizeOrtho();
    window.addEventListener("resize", resizeOrtho);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    return scene;
}