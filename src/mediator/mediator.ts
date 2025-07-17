import { Container, inject, injectable, Newable } from "inversify";
import { INotification, IPublisher, IReqHandler, IRequest, ISender, ISenderSymbol } from ".";

export const METADATA_KEY = {
  handlerFor: Symbol.for("empack:handleFor"),
};

export abstract class MediatedController {
  @inject(ISenderSymbol) private readonly _sender!: ISender;

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

class MediatorMap {
  private _map = new Map();

  set(req: any, handler: any) {
    this._map.set(req, handler);
  }

  get(req: any) {
    return this._map.get(req);
  }

  loadFromHandlers(handlers: Newable<any>[]) {
    for (const handler of handlers) {
      const req = Reflect.getMetadata(METADATA_KEY.handlerFor, handler);
      if (!req) {
        throw new Error(`Handler ${handler.name} is missing decorator`);
      }
      this._map.set(req, handler);
    }
    return this;
  }
}

export class Mediator implements ISender, IPublisher {
  private readonly _mediatorMap: MediatorMap;
  constructor(
    private readonly container: Container,
    handlers: Newable<any>[],
    private readonly pipeline?: {
      pre?: Newable<MediatorPipe>[];
      post?: Newable<MediatorPipe>[];
    },
  ) {
    this._mediatorMap = new MediatorMap().loadFromHandlers(handlers);
  }

  private async processPipeline(
    input: any,
    pipelines?: Newable<MediatorPipe>[],
  ): Promise<any> {
    let index = 0;
    const next = async (pipe: any): Promise<any> => {
      if (pipelines && index < pipelines.length) {
        const PipelineClass = pipelines[index++];
        const pipeline = this.container.get(PipelineClass);
        return await pipeline.handle(pipe, (nextInput: any) => next(nextInput));
      } else {
        return pipe;
      }
    };
    return await next(input);
  }

  async send<TRes>(req: any): Promise<TRes> {
    const handler = this._mediatorMap.get(req.constructor) as new (
      ...args: any[]
    ) => IReqHandler<any, TRes>;
    if (!handler) {
      throw new Error("handler not found");
    }

    return await this.processPipeline(req, this.pipeline?.pre)
      .then((input) => this.container.get(handler).handle(input))
      .then((output) => this.processPipeline(output, this.pipeline?.post));
  }

  async publish<T extends INotification<T>>(event: T): Promise<void> {
    await Promise.all(
      event.getSubscribers().map(async (handler) => {
        const handlerInstance = this.container.get(handler);
        await handlerInstance.handle(event);
      }),
    );
  }
}
