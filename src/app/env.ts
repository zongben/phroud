import dotenv from "dotenv";

export interface IEnv {
  get(key: string): any;
}

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
