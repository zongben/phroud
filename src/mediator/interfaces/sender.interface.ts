import { IRequest } from "./req-handler.interface";

export interface ISender {
  send<
    TReq extends IRequest<TRes>,
    TRes = TReq extends IRequest<infer R> ? R : never,
  >(
    req: TReq,
  ): Promise<TRes>;
}
