import { ContainerModule, interfaces } from "inversify";
export declare abstract class Module {
    protected abstract bindModule(bind: interfaces.Bind): void;
    getModule(): ContainerModule;
}
//# sourceMappingURL=index.d.ts.map