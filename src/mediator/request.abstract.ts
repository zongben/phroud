import { IRequest } from "./interfaces/req-handler.interface";

export abstract class Request<TResult> implements IRequest<TResult> {
  __TYPE_ASSERT?: TResult;
}
