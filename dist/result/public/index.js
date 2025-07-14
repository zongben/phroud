"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchResult = exports.OkReturn = exports.ErrorReturn = void 0;
class ErrorReturn {
    constructor(err) {
        this.isSuccess = false;
        this.error = err;
    }
}
exports.ErrorReturn = ErrorReturn;
class OkReturn {
    constructor(data) {
        this.isSuccess = true;
        this.data = data;
    }
}
exports.OkReturn = OkReturn;
const matchResult = (result, handlers) => {
    if (result.isSuccess) {
        return handlers.ok(result.data);
    }
    const handler = handlers.err[result.error];
    if (!handler) {
        throw new Error(`Unhandled error case: ${result.error.toString()}`);
    }
    return handler(result.error);
};
exports.matchResult = matchResult;
//# sourceMappingURL=index.js.map