"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = exports.Put = exports.Post = exports.Get = exports.Res = exports.Req = exports.Locals = exports.Param = exports.Query = exports.Body = void 0;
exports.Controller = Controller;
exports.Anonymous = Anonymous;
const _internal_1 = require("../../_internal");
function Controller(path, ...middleware) {
    return (target) => {
        Reflect.defineMetadata(_internal_1.CONTROLLER_METADATA.PATH, path, target);
        Reflect.defineMetadata(_internal_1.CONTROLLER_METADATA.MIDDLEWARE, middleware, target);
    };
}
exports.Body = (0, _internal_1.createParamDecorator)("body");
exports.Query = (0, _internal_1.createParamDecorator)("query");
exports.Param = (0, _internal_1.createParamDecorator)("param");
exports.Locals = (0, _internal_1.createParamDecorator)("locals");
exports.Req = (0, _internal_1.createParamDecorator)("req");
exports.Res = (0, _internal_1.createParamDecorator)("res");
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