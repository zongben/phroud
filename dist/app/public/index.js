"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_TYPES = exports.App = void 0;
var app_1 = require("./app");
Object.defineProperty(exports, "App", { enumerable: true, get: function () { return app_1.App; } });
exports.APP_TYPES = {
    IEnv: Symbol.for("empack:IEnv"),
    ILogger: Symbol.for("empack:ILogger"),
};
//# sourceMappingURL=index.js.map