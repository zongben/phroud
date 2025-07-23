import { BindingFluentAPI } from "./interfaces/index";
import { ContainerModule } from "./types/index";

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
