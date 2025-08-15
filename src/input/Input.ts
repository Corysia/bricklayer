export class Input {
    private readonly down = new Set<string>();
    private readonly justPressed = new Set<string>();
    private readonly repeatTimers = new Map<string, number>();
    private readonly das = 140; // ms
    private readonly arr = 40;  // ms

    constructor() {
        window.addEventListener("keydown", (e: KeyboardEvent) => {
            if (!this.down.has(e.code)) {
                this.justPressed.add(e.code);
                this.repeatTimers.set(e.code, performance.now() + this.das);
            }
            this.down.add(e.code);
            // prevent page scrolling on arrows/space
            if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Space"].includes(e.code)) e.preventDefault();
        }, { passive: false });

        window.addEventListener("keyup", (e: KeyboardEvent) => {
            this.down.delete(e.code);
            this.justPressed.delete(e.code);
            this.repeatTimers.delete(e.code);
        });
    }

    public consumeJustPressed(code: string): boolean {
        if (this.justPressed.has(code)) { this.justPressed.delete(code); return true; }
        return false;
    }

    public repeating(code: string, now: number): boolean {
        if (!this.down.has(code)) return false;
        if (this.consumeJustPressed(code)) return true;
        const next = this.repeatTimers.get(code);
        if (next !== undefined && now >= next) {
            this.repeatTimers.set(code, now + this.arr);
            return true;
        }
        return false;
    }

    public isDown(code: string): boolean { return this.down.has(code); }
}