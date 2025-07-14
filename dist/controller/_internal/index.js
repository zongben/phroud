"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferResponse = exports.FileResponse = exports.JsonResponse = exports.ResWith = exports.CONTROLLER_METADATA = exports.ANONYMOUS_KEY = void 0;
exports.isAnonymous = isAnonymous;
__exportStar(require("./param.decorator"), exports);
__exportStar(require("./route.decorator"), exports);
exports.ANONYMOUS_KEY = Symbol("empack:anonymous");
function isAnonymous(prototype, methodName) {
    if (Reflect.hasMetadata(exports.ANONYMOUS_KEY, prototype.constructor)) {
        return true;
    }
    if (Reflect.hasMetadata(exports.ANONYMOUS_KEY, prototype, methodName)) {
        return true;
    }
    return false;
}
exports.CONTROLLER_METADATA = {
    PATH: Symbol("empack:controller_path"),
    MIDDLEWARE: Symbol("empack:controller_middleware"),
};
class ResWith {
    constructor() {
        this._withData = {};
    }
    with(data) {
        this._withData = {
            headers: Object.assign(Object.assign({}, (this._withData.headers || {})), (data.headers || {})),
            cookies: [...(this._withData.cookies || []), ...(data.cookies || [])],
        };
        return this;
    }
    getWithData() {
        return this._withData;
    }
}
exports.ResWith = ResWith;
class JsonResponse extends ResWith {
    constructor(status, body) {
        super();
        this.status = status;
        this.body = body;
    }
}
exports.JsonResponse = JsonResponse;
class FileResponse extends ResWith {
    constructor(fileName, filePath) {
        super();
        this.fileName = fileName;
        this.filePath = filePath;
    }
}
exports.FileResponse = FileResponse;
class BufferResponse extends ResWith {
    constructor(data, fileName, mimeType = "application/octet-stream") {
        super();
        this.data = data;
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.with({
            headers: {
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Content-Type": mimeType,
            },
        });
    }
}
exports.BufferResponse = BufferResponse;
//# sourceMappingURL=index.js.map