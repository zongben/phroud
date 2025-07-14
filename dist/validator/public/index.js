"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.createRule = void 0;
const express_validator_1 = require("express-validator");
const createRule = (handler) => {
    return handler((k) => k);
};
exports.createRule = createRule;
const validate = (chains, options) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        for (const chain of chains) {
            yield chain.run(req);
        }
        const errs = (0, express_validator_1.validationResult)(req);
        if (!errs.isEmpty()) {
            return res
                .status((_a = options === null || options === void 0 ? void 0 : options.status) !== null && _a !== void 0 ? _a : 400)
                .json((options === null || options === void 0 ? void 0 : options.handler)
                ? options.handler(errs.array())
                : errs.array().map((x) => x.msg));
        }
        next();
    });
};
exports.validate = validate;
//# sourceMappingURL=index.js.map