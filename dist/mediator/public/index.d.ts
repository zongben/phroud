import { IRequest } from "./interfaces";
export declare const MEDIATOR_TYPES: {
    ISender: symbol;
    IPublisher: symbol;
    PrePipeline: symbol;
    PostPipeline: symbol;
};
export declare function HandleFor<TReq>(req: new (...args: any[]) => TReq): ClassDecorator;
export declare abstract class MediatedController {
    private readonly _sender;
    dispatch<TReq extends IRequest<TRes>, TRes = TReq extends IRequest<infer R> ? R : never>(req: TReq): Promise<TRes>;
}
export declare abstract class MediatorPipe {
    abstract handle(req: any, next: any): Promise<any>;
}
export declare abstract class Request<TResult> implements IRequest<TResult> {
    __TYPE_ASSERT?: TResult;
}
//# sourceMappingURL=index.d.ts.map