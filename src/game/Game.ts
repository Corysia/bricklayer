
import { Input } from "../input/Input";
import { Grid } from "./Grid";
import { Piece } from "./Piece";
import { PieceFactory } from "./PieceFactory";
import { BoxPool } from "../render/BoxPool";
import { type Cell, ROWS_HIDDEN } from "../types";
import type { Scene } from "@babylonjs/core";

export class Game {
    private readonly grid = new Grid();
    private readonly factory = new PieceFactory();
    private current!: Piece;
    private readonly input: Input;
    private readonly renderer: BoxPool;
    private dropTimer = 0;
    private dropInterval = 800; // ms
    private readonly softDropFactor = 8;
    private over = false;
    private linesCleared = 0;

    constructor(scene: Scene, private readonly statusEl?: HTMLElement) {
        this.input = new Input();
        this.renderer = new BoxPool(scene);
        this.spawn();
        this.updateStatus();
    }

    private updateStatus() {
        if (!this.statusEl) return;

        if (this.over) {
            this.statusEl.textContent = `🏁 Game Over — Total lines: ${this.linesCleared}`;
        } else {
            this.statusEl.textContent = `Lines: ${this.linesCleared}`;
        }
    }

    private spawn() {
        this.current = new Piece(this.factory.next());
        this.current.y = 0; // top, may overlap hidden rows
        // try spawn slightly above visible playfield
        if (this.current.collides((x, y) => this.grid.get(x, y) !== 0)) {
            this.over = true;
            this.updateStatus();
        }
    }

    private lockPiece() {
        const v = (["", "I", "J", "L", "O", "S", "T", "Z"].indexOf(this.current.kind) as Cell);
        this.grid.merge(this.current.cells(v));
        const cleared = this.grid.clearFullLines();
        if (cleared > 0) {
            this.linesCleared += cleared;
            // speed up subtly
            // this.dropInterval = Math.max(120, this.dropInterval - cleared * 20);
        }
        this.spawn();
        this.updateStatus();
    }

    private hardDrop() {
        while (this.current.tryMove(0, 1, (x, y) => this.grid.get(x, y) !== 0)) {/* fall */ }
        this.lockPiece();
    }

    update(dtMs: number) {
        if (this.over) return;
        const now = performance.now();

        // input: rotation
        if (this.input.consumeJustPressed("ArrowUp")) {
            this.current.tryRotateCW((x, y) => this.grid.get(x, y) !== 0);
        }

        // input: hard drop
        if (this.input.consumeJustPressed("Space")) {
            this.hardDrop();
            return;
        }

        // input: horizontal with DAS/ARR
        if (this.input.repeating("ArrowLeft", now)) {
            this.current.tryMove(-1, 0, (x, y) => this.grid.get(x, y) !== 0);
        }
        if (this.input.repeating("ArrowRight", now)) {
            this.current.tryMove(1, 0, (x, y) => this.grid.get(x, y) !== 0);
        }

        // gravity
        const gravity = this.input.isDown("ArrowDown")
            ? this.dropInterval / this.softDropFactor
            : this.dropInterval;

        this.dropTimer += dtMs;
        if (this.dropTimer >= gravity) {
            this.dropTimer = 0;
            const moved = this.current.tryMove(0, 1, (x, y) => this.grid.get(x, y) !== 0);
            if (!moved) this.lockPiece();
        }

        // render
        this.render();
    }

    private render() {
        this.renderer.begin();

        // draw grid
        this.grid.forEachFilled((x, y, v) => {
            this.renderer.draw(x, y, v);
        });

        // draw active piece (skip hidden rows if you want, but render statefully)
        const v = (["", "I", "J", "L", "O", "S", "T", "Z"].indexOf(this.current.kind) as Cell);
        for (const c of this.current.cells(v)) {
            // hide blocks above visible area
            if (c.y < ROWS_HIDDEN) continue;
            this.renderer.draw(c.x, c.y, c.v);
        }
    }
}