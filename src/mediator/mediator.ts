import { Container, inject, injectable } from "inversify";
import { MEDIATOR_TYPES } from "./types";
import { IMediator } from "./interfaces/mediator.interface";
import { IMediatorMap } from "./interfaces/mediator-map.interface";
import { IReqHandler } from "./interfaces/req-handler.interface";
import { MediatorPipe } from "./mediator-pipe";
import { INotification } from "./interfaces/notification.interface";

@injectable()
export class Mediator implements IMediator {
  constructor(
    @inject("container") private readonly _container: Container,
    @inject(MEDIATOR_TYPES.IMediatorMap)
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
