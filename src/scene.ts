import { ArcRotateCamera, Color3, HemisphericLight, Scene, Vector3 } from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Camera } from "@babylonjs/core/Cameras/camera";

export function createScene(engine: Engine) {
    const scene = new Scene(engine);
    scene.clearColor = Color3.FromHexString("#0f1116").toColor4(1);

    // Position camera so it faces the front of the board
    // const camera = new ArcRotateCamera("cam", Math.PI / 2, Math.PI / 2, 30, new Vector3(0, 0, 0), scene);
    const camera = new ArcRotateCamera(
        "cam",
        -Math.PI / 2, // instead of +Math.PI / 2
        Math.PI / 2,
        30,
        new Vector3(0, 0, 0),
        scene
    );
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;

    // Lock the camera: no user input, no rotation changes
    camera.detachControl(); // removes any existing bindings
    camera.inputs.clear();  // removes all input plugins

    // Face directly toward the board’s Z axis
    camera.setTarget(Vector3.Zero());

    const resizeOrtho = () => {
        const w = engine.getRenderWidth();
        const h = engine.getRenderHeight();
        const aspect = w / h;
        const halfH = 12; // frames 10×22 well
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