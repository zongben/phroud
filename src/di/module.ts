import { Newable } from "inversify";

export type ContainerScope = "singleton" | "request" | "transient" | "constant";

export type ContainerModule = {
  scope: ContainerScope;
  type: symbol;
  constructor: Newable;
};

export interface BindingFluentAPI {
  singleton(type: symbol, constructor: Newable): void;
  request(type: symbol, constructor: Newable): void;
  transient(type: symbol, constructor: Newable): void;
  constant(type: symbol, value: any): void;
}

export abstract class Module {
  private binder: ContainerModule[] = [];

  abstract register(bind: BindingFluentAPI): void;

  getBindings(): ContainerModule[] {
    return this.binder;
  }

  private createBinder(): BindingFluentAPI {
    return {
      singleton: (type, ctor) =>
        this.binder.push({ scope: "singleton", type, constructor: ctor }),
      request: (type, ctor) =>
        this.binder.push({ scope: "request", type, constructor: ctor }),
      transient: (type, ctor) =>
        this.binder.push({ scope: "transient", type, constructor: ctor }),
      constant: (type, value) =>
        this.binder.push({ scope: "constant", type, constructor: value }),
    };
  }

  loadModule() {
    this.register(this.createBinder());
  }
}
