import { Container, inject, injectable, interfaces } from "inversify";
import { IMediator, IMediatorMap } from "./interfaces";
import {
  INotification,
  IPublisher,
  IReqHandler,
  ISender,
} from "../public/interfaces";
import { MEDIATOR_TYPES, MediatorPipe } from "../public";
import { Module } from "../../di";

export const METADATA_KEY = {
  handlerFor: Symbol.for("handleFor"),
};

export const _MEDIATOR_TYPES = {
  IMediator: Symbol.for("IMediator"),
  IMediatorMap: Symbol.for("IMediatorMap"),
};

@injectable()
export class MediatorMap implements IMediatorMap {
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

  protected bindModule(bind: interfaces.Bind): void {
    bind<IMediatorMap>(_MEDIATOR_TYPES.IMediatorMap).toConstantValue(
      this._mediatorMap,
    );
    bind<IMediator>(_MEDIATOR_TYPES.IMediator).to(Mediator).inSingletonScope();
    bind<ISender>(MEDIATOR_TYPES.ISender).to(Mediator).inSingletonScope();
    bind<IPublisher>(MEDIATOR_TYPES.IPublisher).to(Mediator).inSingletonScope();
    bind<Container>("container").toConstantValue(this.container);
    bind<MediatorPipe[]>(MEDIATOR_TYPES.PrePipeline).toConstantValue(
      this.pipeline?.pre ?? [],
    );
    bind<MediatorPipe[]>(MEDIATOR_TYPES.PostPipeline).toConstantValue(
      this.pipeline?.post ?? [],
    );
  }
}

@injectable()
export class Mediator implements IMediator {
  constructor(
    @inject("container") private readonly _container: Container,
    @inject(_MEDIATOR_TYPES.IMediatorMap)
    private readonly _mediatorMap: IMediatorMap,
    @inject(MEDIATOR_TYPES.PrePipeline)
    private readonly _prePipeline: any,
    @inject(MEDIATOR_TYPES.PostPipeline)
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
        const pipeline = this._container.resolve(PipelineClass);
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
      .then((input) => this._container.resolve(handler).handle(input))
      .then((output) => this.processPipeline(output, this._postPipeline));
  }

  async publish<T extends INotification<T>>(event: T): Promise<void> {
    await Promise.all(
      event.getSubscribers().map(async (handler) => {
        const handlerInstance = this._container.resolve(handler);
        await handlerInstance.handle(event);
      }),
    );
  }
}
