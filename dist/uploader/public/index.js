"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = upload;
const __1 = require("..");
function upload(storage) {
    const engine = storage
        ? __1.uploader.diskStorage(storage)
        : __1.uploader.memoryStorage();
    return (0, __1.uploader)({ storage: engine });
}
//# sourceMappingURL=index.js.map