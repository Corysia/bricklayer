import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, TransformNode } from "@babylonjs/core";
import type { Cell, PieceKind } from "../types";
import { COLS, ROWS_TOTAL, PIECE_COLORS } from "../types";

export class BoxPool {
    private readonly pool: Mesh[] = [];
    private readonly materials = new Map<PieceKind, StandardMaterial>();
    private readonly parent: TransformNode;

    constructor(scene: Scene, count = COLS * ROWS_TOTAL) {
        this.parent = new TransformNode("board", scene);
        for (const k of Object.keys(PIECE_COLORS) as PieceKind[]) {
            const m = new StandardMaterial(`m_${k}`, scene);
            const c = Color3.FromHexString(PIECE_COLORS[k]);
            m.diffuseColor = c;
            m.emissiveColor = c.scale(0.25);
            m.specularColor = Color3.Black();
            this.materials.set(k, m);
        }
        const proto = MeshBuilder.CreateBox("proto", { size: 0.95 }, scene);
        proto.isVisible = false;

        for (let i = 0; i < count; i++) {
            const inst = proto.createInstance(`b_${i}`);
            inst.isVisible = false;
            inst.parent = this.parent;
            this.pool.push(inst as unknown as Mesh);
        }
    }

    worldFromGrid(x: number, y: number) {
        const wx = x - COLS / 2 + 0.5;
        const wy = -(y - ROWS_TOTAL / 2 + 0.5); // invert so higher y renders higher
        return { x: wx, y: wy };
    }

    begin() {
        for (const b of this.pool) b.isVisible = false;
    }

    draw(x: number, y: number, v: Cell) {
        if (v === 0) return;
        const mesh = this.pool.find(m => !m.isVisible);
        if (!mesh) return; // pool exhausted (shouldn't happen with our size)
        const kind = ["", "I", "J", "L", "O", "S", "T", "Z"][v] as PieceKind;
        const p = this.worldFromGrid(x, y);
        mesh.position.set(p.x, p.y, 0);
        mesh.material = this.materials.get(kind)!;
        mesh.isVisible = true;
    }
}