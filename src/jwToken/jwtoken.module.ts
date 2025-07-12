import { interfaces } from "inversify";
import { IJwTokenHelper } from "./interfaces/jwtoken-helper.interface";
import { Module } from "../app/module";

export class JwTokenHelperModule extends Module {
  constructor(
    private symbol: symbol,
    private jwtHelper: IJwTokenHelper,
  ) {
    super();
  }

  protected bindModule(bind: interfaces.Bind) {
    bind(this.symbol).toConstantValue(this.jwtHelper);
  }
}
