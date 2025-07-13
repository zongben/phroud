import dotenv from "dotenv";
import { IEnv } from "../public/interfaces";
import { AllowAnonymousPath } from "../public";
import { interfaces } from "inversify";
import { ILogger } from "../../logger";

export class Env implements IEnv {
  private _env;

  constructor(path: string) {
    dotenv.config({ path });
    this._env = process.env;
  }

  get(key: string): any {
    const value = this._env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
  }
}

export class AppOptions {
  routerPrefix: string = "/api";
  container: interfaces.ContainerOptions = {
    autoBindInjectable: true,
  };
  allowAnonymousPath: AllowAnonymousPath[] = [];
}

export class Logger implements ILogger {
  error(err: Error) {
    console.error(err.stack || err.message);
  }

  warn(message: string) {
    console.warn(message);
  }

  info(message: string) {
    console.info(message);
  }

  debug(message: string) {
    console.debug(message);
  }
}
