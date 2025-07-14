import { TimeSpan } from "./types";
export declare class Timer {
    private _timeSpans;
    private _stack;
    private _index;
    private constructor();
    static current(): Timer;
    static create(): Timer;
    start(label: string): number;
    end(id: number): TimeSpan | undefined;
    reset(): void;
    getAllTimeSpans(): TimeSpan[];
}
//# sourceMappingURL=timer.d.ts.map