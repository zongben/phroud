import { BindingFluentAPI, Module } from "../../../../src/di";
import { JwTokenHelper, JwTokenSettings } from "../../../../src/jwt";

export const AccessTokenSymbol = Symbol.for("ACCESSTOKEN");
export const RefreshTokenSymbol = Symbol.for("REFRESHTOKEN");

export class JwtModule extends Module {
  constructor(
    private accessTokenSetting: JwTokenSettings,
    private refreshTokenSetting: JwTokenSettings,
  ) {
    super();
  }
  register(bind: BindingFluentAPI): void {
    bind.constant(
      AccessTokenSymbol,
      new JwTokenHelper(this.accessTokenSetting),
    );
    bind.constant(
      RefreshTokenSymbol,
      new JwTokenHelper(this.refreshTokenSetting),
    );
  }
}
