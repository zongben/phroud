import { performance } from "node:perf_hooks";

type TimeSpan = {
  id: number;
  label: string;
  start: number;
  end?: number;
  duration?: number;
  depth?: number;
};

export class Timer {
  private _timeSpans: TimeSpan[] = [];
  private _stack: number[] = [];
  private _index = 0;

  start(label: string): number {
    const id = this._index++;
    this._timeSpans.push({
      id,
      label,
      start: performance.now(),
      depth: this._stack.length,
    });
    this._stack.push(id);
    return id;
  }

  end(id: number): TimeSpan | undefined {
    const timeSpan = this._timeSpans[id];
    if (!timeSpan) {
      return;
    }
    timeSpan.end = performance.now();
    timeSpan.duration = timeSpan.end - timeSpan.start;
    if (this._stack.length > 0 && this._stack[this._stack.length - 1] === id) {
      this._stack.pop();
    }
    return timeSpan;
  }

  getAllTimeSpans(): TimeSpan[] {
    return this._timeSpans;
  }
}
