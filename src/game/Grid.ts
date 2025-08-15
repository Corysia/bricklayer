import { type Cell, COLS, ROWS_TOTAL } from "../types";

export class Grid {
    readonly cols = COLS;
    readonly rows = ROWS_TOTAL;
    private cells: Cell[] = new Array(this.cols * this.rows).fill(0);

    index(x: number, y: number): number { return y * this.cols + x; }

    get(x: number, y: number): Cell {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return 1; // treat OOB as solid
        return this.cells[this.index(x, y)];
    }

    set(x: number, y: number, v: Cell): void {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;
        this.cells[this.index(x, y)] = v;
    }

    clear(): void { this.cells.fill(0); }

    merge(cells: { x: number; y: number; v: Cell }[]) {
        for (const c of cells) this.set(c.x, c.y, c.v);
    }

    isRowFull(y: number): boolean {
        for (let x = 0; x < this.cols; x++) if (this.get(x, y) === 0) return false;
        return true;
    }

    clearFullLines(): number {
        let cleared = 0;
        for (let y = 0; y < this.rows; y++) {
            if (this.isRowFull(y)) {
                cleared++;
                for (let yy = y; yy > 0; yy--) { // shift down
                    for (let x = 0; x < this.cols; x++) {
                        this.set(x, yy, this.get(x, yy - 1));
                    }
                }
                for (let x = 0; x < this.cols; x++) this.set(x, 0, 0);
            }
        }
        return cleared;
    }

    forEachFilled(cb: (x: number, y: number, v: Cell) => void) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const v = this.get(x, y);
                if (v !== 0) cb(x, y, v);
            }
        }
    }
}