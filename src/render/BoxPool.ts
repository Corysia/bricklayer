import { Color3, InstancedMesh, Mesh, MeshBuilder, Scene, StandardMaterial, TransformNode } from "@babylonjs/core";
import type { Cell, PieceKind } from "../types";
import { COLS, ROWS_TOTAL, PIECE_COLORS } from "../types";

export class BoxPool {
    private readonly materials = new Map<PieceKind, StandardMaterial>();
    private readonly sources = new Map<PieceKind, Mesh>();
    private readonly pools = new Map<PieceKind, InstancedMesh[]>();
    private readonly parent: TransformNode;

    constructor(scene: Scene) {
        this.parent = new TransformNode("board", scene);

        // Pre-create one material and one hidden source box per piece kind
        for (const k of Object.keys(PIECE_COLORS) as PieceKind[]) {
            const mat = new StandardMaterial(`m_${k}`, scene);
            const c = Color3.FromHexString(PIECE_COLORS[k]);
            mat.diffuseColor = c;
            mat.emissiveColor = c.scale(0.35); // bump if you want more pop
            mat.specularColor = Color3.Black();
            this.materials.set(k, mat);

            const src = MeshBuilder.CreateBox(`src_${k}`, { size: 0.95 }, scene);
            src.isVisible = false;
            src.material = mat;
            src.parent = this.parent;
            this.sources.set(k, src);
            this.pools.set(k, []);
        }
    }

    private worldFromGrid(x: number, y: number) {
        const wx = x - COLS / 2 + 0.5;
        const wy = -(y - ROWS_TOTAL / 2 + 0.5);
        return { x: wx, y: wy };
    }

    begin() {
        for (const pool of this.pools.values()) {
            for (const inst of pool) inst.isVisible = false;
        }
    }

    draw(x: number, y: number, v: Cell) {
        if (v === 0) return;
        const kind = ["", "I", "J", "L", "O", "S", "T", "Z"][v] as PieceKind;

        const pool = this.pools.get(kind)!;
        let inst = pool.find(i => !i.isVisible);
        if (!inst) {
            const src = this.sources.get(kind)!;
            inst = src.createInstance(`b_${kind}_${pool.length}`);
            inst.parent = this.parent;
            pool.push(inst);
        }

        const p = this.worldFromGrid(x, y);
        inst.position.set(p.x, p.y, 0);
        inst.isVisible = true;
    }
}