"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = exports.Put = exports.Post = exports.Get = exports.FromFiles = exports.FromFile = exports.FromRes = exports.FromReq = exports.FromLocals = exports.FromParam = exports.FromQuery = exports.FromBody = void 0;
exports.Controller = Controller;
exports.Anonymous = Anonymous;
const _internal_1 = require("../../_internal");
function Controller(path, ...middleware) {
    return (target) => {
        Reflect.defineMetadata(_internal_1.CONTROLLER_METADATA.PATH, path, target);
        Reflect.defineMetadata(_internal_1.CONTROLLER_METADATA.MIDDLEWARE, middleware, target);
    };
}
exports.FromBody = (0, _internal_1.createParamDecorator)("body");
exports.FromQuery = (0, _internal_1.createParamDecorator)("query");
exports.FromParam = (0, _internal_1.createParamDecorator)("param");
exports.FromLocals = (0, _internal_1.createParamDecorator)("locals");
exports.FromReq = (0, _internal_1.createParamDecorator)("req");
exports.FromRes = (0, _internal_1.createParamDecorator)("res");
exports.FromFile = (0, _internal_1.createParamDecorator)("file");
exports.FromFiles = (0, _internal_1.createParamDecorator)("files");
exports.Get = (0, _internal_1.createRouteDecorator)("get");
exports.Post = (0, _internal_1.createRouteDecorator)("post");
exports.Put = (0, _internal_1.createRouteDecorator)("put");
exports.Delete = (0, _internal_1.createRouteDecorator)("delete");
function Anonymous() {
    return (target, propertyKey) => {
        if (propertyKey) {
            Reflect.defineMetadata(_internal_1.ANONYMOUS_KEY, true, target, propertyKey);
        }
        else {
            Reflect.defineMetadata(_internal_1.ANONYMOUS_KEY, true, target);
        }
    };
}
//# sourceMappingURL=index.js.map