"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.AppOptions = exports.Env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
class Env {
    constructor(path) {
        dotenv_1.default.config({ path });
        this._env = process.env;
    }
    get(key) {
        const value = this._env[key];
        if (!value) {
            throw new Error(`Environment variable ${key} is not defined`);
        }
        return value;
    }
}
exports.Env = Env;
class AppOptions {
    constructor() {
        this.routerPrefix = "/api";
    }
}
exports.AppOptions = AppOptions;
class Logger {
    error(err) {
        console.error(err.stack || err.message);
    }
    warn(message) {
        console.warn(message);
    }
    info(message) {
        console.info(message);
    }
    debug(message) {
        console.debug(message);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=index.js.map