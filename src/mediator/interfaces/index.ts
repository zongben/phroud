export interface ISender {
  send<
    TReq extends IRequest<TRes>,
    TRes = TReq extends IRequest<infer R> ? R : never,
  >(
    req: TReq,
  ): Promise<TRes>;
}

export interface IRequest<TResult> {
  __TYPE_ASSERT?: TResult;
}

export interface IReqHandler<T extends IRequest<TResult>, TResult> {
  handle(req: T): Promise<TResult>;
}

export interface IPublisher {
  publish<T extends INotification<T>>(event: T): Promise<void>;
}

export interface INotification<T> {
  getSubscribers(): Array<new (...args: any[]) => IEventHandler<T>>;
}

export interface IEventHandler<T> {
  handle(event: T): Promise<void>;
}

export interface IMediatorMap {
  set(req: any, handler: any): void;
  get(req: any): any;
}

export interface IMediator extends ISender, IPublisher {}
