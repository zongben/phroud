import { Newable } from "inversify";

export type ContainerScope = "singleton" | "request" | "transient" | "constant";

export type ContainerModule = {
  scope: ContainerScope;
  type: symbol;
  constructor: Newable;
};

export interface BindingFluentAPI {
  addSingletonScope(type: symbol, constructor: Newable): void;
  addRequestScope(type: symbol, constructor: Newable): void;
  addTransientScope(type: symbol, constructor: Newable): void;
  addConstant(type: symbol, value: any): void;
}

export abstract class Module {
  private binder: ContainerModule[] = [];

  abstract register(bind: BindingFluentAPI): void;

  getBindings(): ContainerModule[] {
    return this.binder;
  }

  private createBinder(): BindingFluentAPI {
    return {
      addSingletonScope: (type, ctor) =>
        this.binder.push({ scope: "singleton", type, constructor: ctor }),
      addRequestScope: (type, ctor) =>
        this.binder.push({ scope: "request", type, constructor: ctor }),
      addTransientScope: (type, ctor) =>
        this.binder.push({ scope: "transient", type, constructor: ctor }),
      addConstant: (type, value) =>
        this.binder.push({ scope: "constant", type, constructor: value }),
    };
  }

  loadModule() {
    this.register(this.createBinder());
  }
}
