import { Newable } from "inversify";

export const MEDIATOR_KEY = {
  handlerFor: Symbol.for("empack:handleFor"),
  subscribe: Symbol.for("empack:subscribeTo"),
};

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
