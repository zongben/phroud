import { interfaces } from "inversify";
import { AllowAnonymousPath } from "./types";

export class AppOptions {
  routerPrefix: string = "/api";
  container: interfaces.ContainerOptions = {
    autoBindInjectable: true,
  };
  allowAnonymousPath: AllowAnonymousPath[] = [];
}
