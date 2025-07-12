import { inject } from "inversify";
import { MEDIATOR_TYPES } from "../mediator/types";
import { ISender } from "../mediator/interfaces/sender.interface";
import { IRequest } from "../mediator/interfaces/req-handler.interface";

export abstract class MediatedController {
  constructor(
    @inject(MEDIATOR_TYPES.ISender) private readonly _sender: ISender,
  ) {}

  async dispatch<
    TReq extends IRequest<TRes>,
    TRes = TReq extends IRequest<infer R> ? R : never,
  >(req: TReq): Promise<TRes> {
    return await this._sender.send(req);
  }
}
