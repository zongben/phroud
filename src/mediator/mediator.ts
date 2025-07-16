import {
  Container,
  ContainerModuleLoadOptions,
  inject,
  injectable,
} from "inversify";
import {
  IMediator,
  IMediatorMap,
  INotification,
  IPublisher,
  IReqHandler,
  IRequest,
  ISender,
} from ".";
import { Module } from "../di";

const _MEDIATOR_TYPES = {
  IMediator: Symbol.for("empack:IMediator"),
  IMediatorMap: Symbol.for("empack:IMediatorMap"),
};

export const MEDIATOR_TYPES = {
  ISender: Symbol.for("empack:ISender"),
  IPublisher: Symbol.for("empack:IPublisher"),
  PrePipeline: Symbol.for("empack:PrePipeline"),
  PostPipeline: Symbol.for("empack:PostPipeline"),
};

export const METADATA_KEY = {
  handlerFor: Symbol.for("empack:handleFor"),
};

export abstract class MediatedController {
  @inject(MEDIATOR_TYPES.ISender) private readonly _sender!: ISender;

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

@injectable()
class MediatorMap implements IMediatorMap {
  private _map = new Map();

  set(req: any, handler: any) {
    this._map.set(req, handler);
  }

  get(req: any) {
    return this._map.get(req);
  }

  loadFromHandlers(handlers: any[]) {
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

@injectable()
export class MediatorModule extends Module {
  private readonly _mediatorMap: MediatorMap;

  constructor(
    private readonly container: Container,
    handlers: Array<new (...args: any[]) => IReqHandler<any, any>>,
    private readonly pipeline?: {
      pre?: MediatorPipe[];
      post?: MediatorPipe[];
    },
  ) {
    super();
    this._mediatorMap = new MediatorMap().loadFromHandlers(handlers);
  }

  protected bindModule(options: ContainerModuleLoadOptions): void {
    options
      .bind<IMediatorMap>(_MEDIATOR_TYPES.IMediatorMap)
      .toConstantValue(this._mediatorMap);
    const mediator = new Mediator(
      this.container,
      this._mediatorMap,
      this.pipeline?.pre ?? [],
      this.pipeline?.post ?? [],
    );
    options
      .bind<IMediator>(_MEDIATOR_TYPES.IMediator)
      .toConstantValue(mediator);
    options.bind<ISender>(MEDIATOR_TYPES.ISender).toConstantValue(mediator);
    options
      .bind<IPublisher>(MEDIATOR_TYPES.IPublisher)
      .toConstantValue(mediator);
    options.bind<Container>("container").toConstantValue(this.container);
    options
      .bind<MediatorPipe[]>(MEDIATOR_TYPES.PrePipeline)
      .toConstantValue(this.pipeline?.pre ?? []);
    options
      .bind<MediatorPipe[]>(MEDIATOR_TYPES.PostPipeline)
      .toConstantValue(this.pipeline?.post ?? []);
  }
}

class Mediator implements IMediator {
  constructor(
    private readonly _container: Container,
    private readonly _mediatorMap: IMediatorMap,
    private readonly _prePipeline: any,
    private readonly _postPipeline: any,
  ) {}

  private async processPipeline(
    input: any,
    pipelines: Array<new (...args: any[]) => MediatorPipe>,
  ): Promise<any> {
    let index = 0;
    const next = async (pipe: any): Promise<any> => {
      if (index < pipelines.length) {
        const PipelineClass = pipelines[index++];
        const pipeline = this._container.get(PipelineClass);
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

    return await this.processPipeline(req, this._prePipeline)
      .then((input) => this._container.get(handler).handle(input))
      .then((output) => this.processPipeline(output, this._postPipeline));
  }

  async publish<T extends INotification<T>>(event: T): Promise<void> {
    await Promise.all(
      event.getSubscribers().map(async (handler) => {
        const handlerInstance = this._container.get(handler);
        await handlerInstance.handle(event);
      }),
    );
  }
}
