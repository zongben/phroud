import { inject, injectable } from "inversify";
import { METADATA_KEY } from "../_internal";
import { IRequest, ISender } from "./interfaces";

export const MEDIATOR_TYPES = {
  ISender: Symbol.for("empack:ISender"),
  IPublisher: Symbol.for("empack:IPublisher"),
  PrePipeline: Symbol.for("empack:PrePipeline"),
  PostPipeline: Symbol.for("empack:PostPipeline"),
};

export function HandleFor<TReq>(
  req: new (...args: any[]) => TReq,
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEY.handlerFor, req, target);
  };
}

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

@injectable()
export abstract class MediatorPipe {
  abstract handle(req: any, next: any): Promise<any>;
}

export abstract class Request<TResult> implements IRequest<TResult> {
  __TYPE_ASSERT?: TResult;
}
