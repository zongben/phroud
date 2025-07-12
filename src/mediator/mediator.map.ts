import { injectable } from "inversify";
import { IMediatorMap } from "./interfaces/mediator-map.interface";
import { METADATA_KEY } from "./decorator/mediator.decorator";

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
