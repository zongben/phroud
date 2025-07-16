import { ContainerModule, ContainerModuleLoadOptions } from "inversify";

export abstract class Module {
  protected abstract bindModule(options: ContainerModuleLoadOptions): void;

  getModule(): ContainerModule {
    return new ContainerModule((options) => {
      this.bindModule(options);
    });
  }
}
