"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARAM_METADATA_KEY = void 0;
exports.createParamDecorator = createParamDecorator;
exports.PARAM_METADATA_KEY = Symbol("empack:param_metadata");
function createParamDecorator(source) {
    return function (name) {
        return (target, propertyKey, parameterIndex) => {
            const existingParams = Reflect.getMetadata(exports.PARAM_METADATA_KEY, target, propertyKey) ||
                [];
            existingParams.push({
                index: parameterIndex,
                source,
                name,
            });
            Reflect.defineMetadata(exports.PARAM_METADATA_KEY, existingParams, target, propertyKey);
        };
    };
}
//# sourceMappingURL=param.decorator.js.map