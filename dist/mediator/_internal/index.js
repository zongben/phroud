"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.Mediator = exports.MediatorModule = exports.MediatorMap = exports._MEDIATOR_TYPES = exports.METADATA_KEY = void 0;
const inversify_1 = require("inversify");
const public_1 = require("../public");
const di_1 = require("../../di");
exports.METADATA_KEY = {
    handlerFor: Symbol.for("empack:handleFor"),
};
exports._MEDIATOR_TYPES = {
    IMediator: Symbol.for("empack:IMediator"),
    IMediatorMap: Symbol.for("empack:IMediatorMap"),
};
let MediatorMap = class MediatorMap {
    constructor() {
        this._map = new Map();
    }
    set(req, handler) {
        this._map.set(req, handler);
    }
    get(req) {
        return this._map.get(req);
    }
    loadFromHandlers(handlers) {
        for (const handler of handlers) {
            const req = Reflect.getMetadata(exports.METADATA_KEY.handlerFor, handler);
            if (!req) {
                throw new Error(`Handler ${handler.name} is missing decorator`);
            }
            this._map.set(req, handler);
        }
        return this;
    }
};
exports.MediatorMap = MediatorMap;
exports.MediatorMap = MediatorMap = __decorate([
    (0, inversify_1.injectable)()
], MediatorMap);
let MediatorModule = class MediatorModule extends di_1.Module {
    constructor(container, handlers, pipeline) {
        super();
        this.container = container;
        this.pipeline = pipeline;
        this._mediatorMap = new MediatorMap().loadFromHandlers(handlers);
    }
    bindModule(bind) {
        var _a, _b, _c, _d;
        bind(exports._MEDIATOR_TYPES.IMediatorMap).toConstantValue(this._mediatorMap);
        bind(exports._MEDIATOR_TYPES.IMediator).to(Mediator).inSingletonScope();
        bind(public_1.MEDIATOR_TYPES.ISender).to(Mediator).inSingletonScope();
        bind(public_1.MEDIATOR_TYPES.IPublisher).to(Mediator).inSingletonScope();
        bind("container").toConstantValue(this.container);
        bind(public_1.MEDIATOR_TYPES.PrePipeline).toConstantValue((_b = (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.pre) !== null && _b !== void 0 ? _b : []);
        bind(public_1.MEDIATOR_TYPES.PostPipeline).toConstantValue((_d = (_c = this.pipeline) === null || _c === void 0 ? void 0 : _c.post) !== null && _d !== void 0 ? _d : []);
    }
};
exports.MediatorModule = MediatorModule;
exports.MediatorModule = MediatorModule = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [inversify_1.Container,
        Array, Object])
], MediatorModule);
let Mediator = class Mediator {
    constructor(_container, _mediatorMap, _prePipeline, _postPipeline) {
        this._container = _container;
        this._mediatorMap = _mediatorMap;
        this._prePipeline = _prePipeline;
        this._postPipeline = _postPipeline;
    }
    processPipeline(input, pipelines) {
        return __awaiter(this, void 0, void 0, function* () {
            let index = 0;
            const next = (pipe) => __awaiter(this, void 0, void 0, function* () {
                if (index < pipelines.length) {
                    const PipelineClass = pipelines[index++];
                    const pipeline = this._container.resolve(PipelineClass);
                    return yield pipeline.handle(pipe, (nextInput) => next(nextInput));
                }
                else {
                    return pipe;
                }
            });
            return yield next(input);
        });
    }
    send(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const handler = this._mediatorMap.get(req.constructor);
            if (!handler) {
                throw new Error("handler not found");
            }
            return yield this.processPipeline(req, this._prePipeline)
                .then((input) => this._container.resolve(handler).handle(input))
                .then((output) => this.processPipeline(output, this._postPipeline));
        });
    }
    publish(event) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(event.getSubscribers().map((handler) => __awaiter(this, void 0, void 0, function* () {
                const handlerInstance = this._container.resolve(handler);
                yield handlerInstance.handle(event);
            })));
        });
    }
};
exports.Mediator = Mediator;
exports.Mediator = Mediator = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)("container")),
    __param(1, (0, inversify_1.inject)(exports._MEDIATOR_TYPES.IMediatorMap)),
    __param(2, (0, inversify_1.inject)(public_1.MEDIATOR_TYPES.PrePipeline)),
    __param(3, (0, inversify_1.inject)(public_1.MEDIATOR_TYPES.PostPipeline)),
    __metadata("design:paramtypes", [inversify_1.Container, Object, Object, Object])
], Mediator);
//# sourceMappingURL=index.js.map