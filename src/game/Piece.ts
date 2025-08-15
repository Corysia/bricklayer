import type { PieceKind, Vec2, Cell } from "../types";
import { COLS, ROWS_TOTAL } from "../types";

type Rotation = Vec2[]; // 4 blocks per rotation
type Rotations = Rotation[];

const R: Record<PieceKind, Rotations> = {
    // Coordinates are relative to a piece origin; y increases downward
    I: [
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
        [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
        [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
    ],
    J: [
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: -1 }],
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 1 }],
    ],
    L: [
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: -1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: -1 }],
    ],
    O: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    ],
    S: [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
    ],
    T: [
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }],
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }],
        [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }],
    ],
    Z: [
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
        [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
        [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
    ],
};

export class Piece {
    kind: PieceKind;
    rot = 0;
    x = Math.floor(COLS / 2);
    y = 0;
    constructor(kind: PieceKind) { this.kind = kind; }

    blocks(): Vec2[] { return R[this.kind][this.rot]; }

    cells(v: Cell): { x: number; y: number; v: Cell }[] {
        return this.blocks().map(b => ({ x: this.x + b.x, y: this.y + b.y, v }));
    }

    collides(isSolid: (x: number, y: number) => boolean): boolean {
        for (const b of this.blocks()) {
            const x = this.x + b.x, y = this.y + b.y;
            if (x < 0 || x >= COLS || y < 0 || y >= ROWS_TOTAL) return true;
            if (isSolid(x, y)) return true;
        }
        return false;
    }

    tryMove(dx: number, dy: number, solid: (x: number, y: number) => boolean): boolean {
        this.x += dx; this.y += dy;
        if (this.collides(solid)) { this.x -= dx; this.y -= dy; return false; }
        return true;
    }

    tryRotateCW(solid: (x: number, y: number) => boolean): boolean {
        const prev = this.rot;
        this.rot = (this.rot + 1) & 3;
        if (!this.collides(solid)) return true;
        // simple wall kicks: try small shifts
        const kicks = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: -1 }];
        for (const k of kicks) {
            this.x += k.x; this.y += k.y;
            if (!this.collides(solid)) return true;
            this.x -= k.x; this.y -= k.y;
        }
        this.rot = prev;
        return false;
    }
}