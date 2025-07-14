"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
const inversify_1 = require("inversify");
class Module {
    getModule() {
        return new inversify_1.ContainerModule((bind) => {
            this.bindModule(bind);
        });
    }
}
exports.Module = Module;
//# sourceMappingURL=index.js.map