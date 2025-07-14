import {
    Anonymous,
  Body,
  Controller,
  Delete,
  Post,
  Responses,
} from "../../../src/controller";
import { MediatedController } from "../../../src/mediator";
import { matchResult } from "../../../src/result";
import { TrackClassMethods } from "../../../src/utils";
import { validate } from "../../../src/validator";
import { LoginCommand } from "../application/use-case/command/login/login.command";
import { LoginReq, LoginRule } from "../contract/auth/login";
import { ErrorBody } from "./error-body";
import { ErrorCodes } from "../application/error-codes";
import { RegisterReq, RegisterRule } from "../contract/auth/register";
import { RegisterCommand } from "../application/use-case/command/register/register.command";

@TrackClassMethods()
@Controller("/auth")
@Anonymous()
export class AuthController extends MediatedController {
  @Post("/register", validate(RegisterRule))
  async register(@Body() req: RegisterReq) {
    const command = new RegisterCommand(req);
    const result = await this.dispatch(command);
    return matchResult(result, {
      ok: (v) => {
        return Responses.Created(v);
      },
      err: {
        [ErrorCodes.USER_ALREADY_EXISTS]: (e) => {
          return Responses.Conflict<ErrorBody>({
            errorCode: e,
          });
        },
      },
    });
  }

  @Post("/login", validate(LoginRule))
  async login(@Body() req: LoginReq) {
    const command = new LoginCommand(req);
    const result = await this.dispatch(command);
    return matchResult(result, {
      ok: (v) => {
        return Responses.OK({
          accessToken: v.accessToken,
        }).with({
          cookies: [
            {
              key: "refresh_token",
              value: v.refreshToken,
              options: {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 30, // 30days
              },
            },
          ],
        });
      },
      err: {
        [ErrorCodes.ACCOUNT_OR_PASSWORD_INCORRECT]: (e) => {
          return Responses.Unauthorized<ErrorBody>({
            errorCode: e,
          });
        },
      },
    });
  }

  @Delete("/")
  async delete() {}

  @Post("/error")
  async error() {
    throw new Error("error test");
  }
}
