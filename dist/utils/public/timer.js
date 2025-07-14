"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
const node_perf_hooks_1 = require("node:perf_hooks");
const _internal_1 = require("../_internal");
class Timer {
    constructor() {
        this._timeSpans = [];
        this._stack = [];
        this._index = 0;
    }
    static current() {
        var _a;
        return (_a = _internal_1.timerStorage.getStore()) !== null && _a !== void 0 ? _a : new Timer();
    }
    static create() {
        return new Timer();
    }
    start(label) {
        const id = this._index++;
        this._timeSpans.push({
            id,
            label,
            start: node_perf_hooks_1.performance.now(),
            depth: this._stack.length,
        });
        this._stack.push(id);
        return id;
    }
    end(id) {
        const timeSpan = this._timeSpans[id];
        if (!timeSpan) {
            return;
        }
        timeSpan.end = node_perf_hooks_1.performance.now();
        timeSpan.duration = timeSpan.end - timeSpan.start;
        if (this._stack.length > 0 && this._stack[this._stack.length - 1] === id) {
            this._stack.pop();
        }
        return timeSpan;
    }
    reset() {
        this._index = 0;
        this._stack = [];
        this._timeSpans = [];
    }
    getAllTimeSpans() {
        return this._timeSpans;
    }
}
exports.Timer = Timer;
//# sourceMappingURL=timer.js.map