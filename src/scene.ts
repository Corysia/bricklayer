// src/scene.ts
import {
    ArcRotateCamera,
    Color3,
    HemisphericLight,
    MeshBuilder,
    Scene,
    StandardMaterial,
    TransformNode,
    Vector3,
} from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { COLS, ROWS_VISIBLE, ROWS_HIDDEN } from "./types";

export function createScene(engine: Engine) {
    const scene = new Scene(engine);
    scene.clearColor = Color3.FromHexString("#0f1116").toColor4(1);

    // Fixed, inputless, orthographic camera facing the board
    const camera = new ArcRotateCamera("cam", -Math.PI / 2, Math.PI / 2, 30, Vector3.Zero(), scene);
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.detachControl();
    camera.inputs.clear();
    camera.setTarget(Vector3.Zero());

    // Responsive ortho framing
    const resizeOrtho = () => {
        const w = engine.getRenderWidth();
        const h = engine.getRenderHeight();
        const aspect = w / h;
        const halfH = 12; // frames 10×22 nicely
        camera.orthoTop = halfH;
        camera.orthoBottom = -halfH;
        camera.orthoLeft = -halfH * aspect;
        camera.orthoRight = halfH * aspect;
    };
    resizeOrtho();
    window.addEventListener("resize", resizeOrtho);

    // Soft ambient light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // Add the playfield frame (left/right walls + bottom)
    addPlayfieldFrame(scene);

    return scene;
}

// Creates a subtle frame around the visible 10×20 well
function addPlayfieldFrame(scene: Scene) {
    const frameRoot = new TransformNode("frame", scene);

    const mat = new StandardMaterial("frameMat", scene);
    mat.diffuseColor = Color3.Gray().scale(0.45);
    mat.emissiveColor = Color3.Gray().scale(0.18);
    mat.specularColor = Color3.Black();

    // Dimensions in world units (1 unit = 1 cell)
    const halfW = COLS / 2;
    const halfH = ROWS_VISIBLE / 2;
    const centerY = -ROWS_HIDDEN / 2; // center the frame over the visible rows
    const thickness = 0.08;
    const depth = 0.02;
    const z = -0.02; // keep behind blocks

    // Left wall
    const left = MeshBuilder.CreateBox(
        "pf_left",
        { width: thickness, height: ROWS_VISIBLE, depth },
        scene
    );
    left.position.set(-halfW - thickness / 2, centerY, z);
    left.material = mat;
    left.parent = frameRoot;

    // Right wall
    const right = left.clone("pf_right")!;
    right.position.x = halfW + thickness / 2;
    right.parent = frameRoot;

    // Bottom bar
    const bottom = MeshBuilder.CreateBox(
        "pf_bottom",
        { width: COLS, height: thickness, depth },
        scene
    );
    bottom.position.set(0, centerY - halfH - thickness / 2, z);
    bottom.material = mat;
    bottom.parent = frameRoot;

    // Optional: top guideline (very subtle)
    // const top = bottom.clone("pf_top")!;
    // top.position.y = centerY + halfH + thickness / 2;
    // top.material = mat;
    // top.visibility = 0.4;
    // top.parent = frameRoot;
}