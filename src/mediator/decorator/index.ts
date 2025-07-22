import { Newable } from "inversify";
import { MEDIATOR_KEY } from "../mediator.js";

export function HandleFor<TReq>(
  req: new (...args: any[]) => TReq,
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(MEDIATOR_KEY.handlerFor, req, target);
  };
}

export function Subscribe(event: Newable): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(MEDIATOR_KEY.subscribe, event, target);
  };
}
