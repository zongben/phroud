"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackClassMethods = TrackClassMethods;
exports.TrackMethod = TrackMethod;
const timer_1 = require("./timer");
function TrackClassMethods() {
    return (target) => {
        const methodNames = Object.getOwnPropertyNames(target.prototype).filter((name) => name !== "constructor" && typeof target.prototype[name] === "function");
        for (const name of methodNames) {
            const original = target.prototype[name];
            target.prototype[name] = function (...args) {
                var _a;
                const timer = timer_1.Timer.current();
                const label = `${target.name}.${name}`;
                const id = (_a = timer === null || timer === void 0 ? void 0 : timer.start(label)) !== null && _a !== void 0 ? _a : -1;
                try {
                    const result = original.apply(this, args);
                    return result instanceof Promise
                        ? result.finally(() => timer === null || timer === void 0 ? void 0 : timer.end(id))
                        : (timer === null || timer === void 0 ? void 0 : timer.end(id), result);
                }
                catch (err) {
                    timer === null || timer === void 0 ? void 0 : timer.end(id);
                    throw err;
                }
            };
        }
    };
}
function TrackMethod() {
    return (target, propertyKey, descriptor) => {
        const original = descriptor.value;
        descriptor.value = function (...args) {
            var _a, _b, _c;
            const isStatic = typeof target === "function";
            const className = isStatic
                ? target.name
                : ((_b = (_a = target.constructor) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "Function");
            const timer = timer_1.Timer.current();
            const label = `${className}.${String(propertyKey)}`;
            const id = (_c = timer === null || timer === void 0 ? void 0 : timer.start(label)) !== null && _c !== void 0 ? _c : -1;
            try {
                const result = original.apply(this, args);
                return result instanceof Promise
                    ? result.finally(() => timer === null || timer === void 0 ? void 0 : timer.end(id))
                    : (timer === null || timer === void 0 ? void 0 : timer.end(id), result);
            }
            catch (err) {
                timer === null || timer === void 0 ? void 0 : timer.end(id);
                throw err;
            }
        };
        return descriptor;
    };
}
//# sourceMappingURL=tracker.js.map