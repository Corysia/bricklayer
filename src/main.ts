import { Engine } from "@babylonjs/core/Engines/engine";
import { createScene } from "./scene";
import { Game } from "./game/Game";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, antialias: true }, true);

const scene = createScene(engine);
const statusEl = document.getElementById("status")!;
const game = new Game(scene, statusEl);

let last = performance.now();
engine.runRenderLoop(() => {
    const now = performance.now();
    const dt = now - last; last = now;
    game.update(dt);
    scene.render();
});

window.addEventListener("resize", () => engine.resize());