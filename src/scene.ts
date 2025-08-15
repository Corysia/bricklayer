import { ArcRotateCamera, Color3, HemisphericLight, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import { COLS, ROWS_VISIBLE, ROWS_HIDDEN } from "./types";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";

export function createScene(engine: Engine) {
    const scene = new Scene(engine);
    scene.clearColor = Color3.FromHexString("#0f1116").toColor4(1);

    // Fixed, inputless, orthographic camera facing the board
    const camera = new ArcRotateCamera("cam", -Math.PI / 2, Math.PI / 2, 30, Vector3.Zero(), scene);
    camera.detachControl();
    camera.inputs.clear();
    camera.setTarget(Vector3.Zero());

    // Responsive ortho framing
    // Keep camera.beta = Math.PI / 2
    const resizeHeadOn = () => {
        const aspect = engine.getRenderWidth() / engine.getRenderHeight();
        const fov = camera.fov;
        const tanY = Math.tan(fov / 2);
        const tanX = tanY * aspect;
        const hx = COLS / 2;
        const hy = (ROWS_VISIBLE + ROWS_HIDDEN) / 2;
        const margin = 0.06; // 6%

        const needY = hy / tanY;
        const needX = hx / tanX;
        camera.radius = Math.max(needX, needY) * (1 + margin);
    };
    resizeHeadOn();
    window.addEventListener("resize", resizeHeadOn);

    // Soft ambient light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // Add backplane first (furthest back)
    addBackplane(scene);

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
    const right = left.clone("pf_right");
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

function addBackplane(scene: Scene) {
    const root = new TransformNode("backplaneRoot", scene);

    // Base material
    const mat = new StandardMaterial("backplaneMat", scene);
    mat.diffuseColor = Color3.FromHexString("#10121A");      // dark base
    mat.emissiveColor = Color3.FromHexString("#10121A").scale(0.15);
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false; // ensure visible regardless of plane normal

    // Optional: subtle grid texture matching cell boundaries
    const texW = COLS * 32;
    const texH = ROWS_VISIBLE * 32;
    const gridTex = new DynamicTexture("backplaneGrid", { width: texW, height: texH }, scene, false);
    const ctx = gridTex.getContext();

    // Background fill
    ctx.fillStyle = "#10121A";
    ctx.fillRect(0, 0, texW, texH);

    // Grid lines
    ctx.strokeStyle = "#222533"; // faint bluish-gray
    ctx.lineWidth = 1;
    const cellW = texW / COLS;
    const cellH = texH / ROWS_VISIBLE;

    // Vertical lines
    for (let x = 0; x <= COLS; x++) {
        const px = Math.round(x * cellW) + 0.5; // crisp 1px
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, texH);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= ROWS_VISIBLE; y++) {
        const py = Math.round(y * cellH) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(texW, py);
        ctx.stroke();
    }

    gridTex.update();
    mat.diffuseTexture = gridTex;

    // Geometry
    const plane = MeshBuilder.CreatePlane("backplane", {
        width: COLS,
        height: ROWS_VISIBLE
    }, scene);

    // Align with the visible well
    const centerY = -ROWS_HIDDEN / 2; // same logic as the frame
    plane.position.set(0, centerY, -0.04); // behind the frame (-0.02) and blocks (0)
    plane.isPickable = false;
    plane.material = mat;
    plane.parent = root;
}