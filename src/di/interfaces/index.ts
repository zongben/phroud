import { Newable } from "inversify";

export interface BindingFluentAPI {
  addSingletonScope(type: symbol, constructor: Newable): void;
  addRequestScope(type: symbol, constructor: Newable): void;
  addTransientScope(type: symbol, constructor: Newable): void;
  addConstant(type: symbol, value: any): void;
}
