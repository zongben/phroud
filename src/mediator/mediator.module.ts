import { Container, injectable, interfaces } from "inversify";
import { Mediator } from "./mediator";
import { MEDIATOR_TYPES } from "./types";
import { MediatorPipe } from "./mediator-pipe";
import { IMediatorMap } from "./interfaces/mediator-map.interface";
import { IMediator } from "./interfaces/mediator.interface";
import { ISender } from "./interfaces/sender.interface";
import { IPublisher } from "./interfaces/publisher.interface";
import { MediatorMap } from "./mediator.map";
import { IReqHandler } from "./interfaces/req-handler.interface";
import { Module } from "../app/module";

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
    bind<IMediatorMap>(MEDIATOR_TYPES.IMediatorMap).toConstantValue(
      this._mediatorMap,
    );
    bind<IMediator>(MEDIATOR_TYPES.IMediator).to(Mediator).inSingletonScope();
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
