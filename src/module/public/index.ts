import { ContainerModule, interfaces } from "inversify";

export abstract class Module {
  protected abstract bindModule(bind: interfaces.Bind): void;

  getModule(): ContainerModule {
    return new ContainerModule((bind) => {
      this.bindModule(bind);
    });
  }
}
