"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwTokenHelperModule = exports.JwTokenHelper = void 0;
exports.jwtValidHandler = jwtValidHandler;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const di_1 = require("../../di");
function jwtValidHandler(secret, handler) {
    return (req, res, next) => {
        function handleError(fallbackStatus, fallbackMessage, handlerFn) {
            if (handlerFn) {
                const result = handlerFn(req, res);
                res.status(result.status).json(result.body);
            }
            else {
                res.status(fallbackStatus).json(fallbackMessage);
            }
        }
        let token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer ")) {
            handleError(401, "Unauthorized", handler === null || handler === void 0 ? void 0 : handler.onUnauthorized);
            return;
        }
        token = token.slice(7, token.length);
        try {
            const payload = jsonwebtoken_1.default.verify(token, secret);
            res.locals.jwt = payload;
            if (handler === null || handler === void 0 ? void 0 : handler.onSuccess) {
                handler.onSuccess(payload, req, res, next);
                return;
            }
            else {
                next();
            }
        }
        catch (err) {
            if (err.name === "TokenExpiredError") {
                handleError(401, "Token Expired", handler === null || handler === void 0 ? void 0 : handler.onExpired);
            }
            else {
                handleError(401, "Unauthorized", handler === null || handler === void 0 ? void 0 : handler.onUnauthorized);
            }
            return;
        }
    };
}
class JwTokenHelper {
    constructor(settings) {
        this.settings = settings;
    }
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.settings.secret, this.settings.options);
    }
    verifyToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, this.settings.secret);
            return typeof payload === "string" ? null : payload;
        }
        catch (_a) {
            return null;
        }
    }
}
exports.JwTokenHelper = JwTokenHelper;
class JwTokenHelperModule extends di_1.Module {
    constructor(symbol, jwtHelper) {
        super();
        this.symbol = symbol;
        this.jwtHelper = jwtHelper;
    }
    bindModule(bind) {
        bind(this.symbol).toConstantValue(this.jwtHelper);
    }
}
exports.JwTokenHelperModule = JwTokenHelperModule;
//# sourceMappingURL=index.js.map