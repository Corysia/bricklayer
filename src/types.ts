export type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 0 empty, 1–7 tetromino types
export type Vec2 = { x: number; y: number };

export const COLS = 10;
export const ROWS_VISIBLE = 20;
export const ROWS_HIDDEN = 2; // spawn buffer
export const ROWS_TOTAL = ROWS_VISIBLE + ROWS_HIDDEN;

export type PieceKind = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

export const PIECE_COLORS: Record<PieceKind, string> = {
    I: "#00BCD4",
    J: "#3F51B5",
    L: "#FF9800",
    O: "#FFC107",
    S: "#4CAF50",
    T: "#9C27B0",
    Z: "#F44336"
};