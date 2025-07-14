import { Container, interfaces } from "inversify";
import { IMediator, IMediatorMap } from "./interfaces";
import { INotification, IReqHandler } from "../public/interfaces";
import { MediatorPipe } from "../public";
import { Module } from "../../di";
export declare const METADATA_KEY: {
    handlerFor: symbol;
};
export declare const _MEDIATOR_TYPES: {
    IMediator: symbol;
    IMediatorMap: symbol;
};
export declare class MediatorMap implements IMediatorMap {
    private _map;
    set(req: any, handler: any): void;
    get(req: any): any;
    loadFromHandlers(handlers: any[]): this;
}
export declare class MediatorModule extends Module {
    private readonly container;
    private readonly pipeline?;
    private readonly _mediatorMap;
    constructor(container: Container, handlers: Array<new (...args: any[]) => IReqHandler<any, any>>, pipeline?: {
        pre?: MediatorPipe[];
        post?: MediatorPipe[];
    } | undefined);
    protected bindModule(bind: interfaces.Bind): void;
}
export declare class Mediator implements IMediator {
    private readonly _container;
    private readonly _mediatorMap;
    private readonly _prePipeline;
    private readonly _postPipeline;
    constructor(_container: Container, _mediatorMap: IMediatorMap, _prePipeline: any, _postPipeline: any);
    private processPipeline;
    send<TRes>(req: any): Promise<TRes>;
    publish<T extends INotification<T>>(event: T): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map