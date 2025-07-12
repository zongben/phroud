export interface IRequest<TResult> {
  __TYPE_ASSERT?: TResult;
}

export interface IReqHandler<T extends IRequest<TResult>, TResult> {
  handle(req: T): Promise<TResult>;
}
