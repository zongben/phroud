import { MediatorRequest } from "../mediator";

export interface ISender {
  send<
    TReq extends MediatorRequest<TRes>,
    TRes = TReq extends MediatorRequest<infer R> ? R : never,
  >(
    req: TReq,
  ): Promise<TRes>;
}

export interface IReqHandler<T extends MediatorRequest<TResult>, TResult> {
  handle(req: T): Promise<TResult>;
}

export interface IPublisher {
  publish<T extends object>(event: T): Promise<void>;
}

export interface IEventHandler<T> {
  handle(event: T): Promise<void>;
}
