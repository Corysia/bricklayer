import type { PieceKind } from "../types";

export class PieceFactory {
    private bag: PieceKind[] = [];

    private refill() {
        this.bag = ["I", "J", "L", "O", "S", "T", "Z"];
        // Fisher–Yates shuffle
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }

    next(): PieceKind {
        if (this.bag.length === 0) this.refill();
        return this.bag.pop()!;
    }
}