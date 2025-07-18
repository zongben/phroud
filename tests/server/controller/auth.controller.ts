import {
  Anonymous,
  FromBody,
  Controller,
  Get,
  Post,
  Responses,
  FromFile,
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
import { inject } from "inversify";
import { ScopeTest, ScopeTestSymbol } from "../domain/user/user.root";
import { createMulter, uploader } from "../../../src/uploader";
import { AsyncTestMiddleware } from "../middleware";

const storage: uploader.DiskStorageOptions = {
  destination: `${process.cwd()}/tests/upload_test/`,
};

const multer = createMulter(storage);

@TrackClassMethods()
@Controller("/auth")
@Anonymous()
export class AuthController extends MediatedController {
  constructor(@inject(ScopeTestSymbol) private readonly _scopeTest: ScopeTest) {
    super();
  }

  @Post("/register", validate(RegisterRule))
  async register(@FromBody() req: RegisterReq) {
    console.log("from controller: ", this._scopeTest.index);
    this._scopeTest.index++;
    console.log("and add one in controller: ", this._scopeTest.index);

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
  async login(@FromBody() req: LoginReq) {
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

  @Get("/empty", AsyncTestMiddleware, (_req, _res, next) => {
    console.log("sync function");
    next();
  })
  async empty() {}

  @Post("/error", AsyncTestMiddleware)
  async error() {
    throw new Error("error test");
  }

  @Get("/file")
  async getFile() {
    return Responses.File("test.txt", `tests/assets/test.txt`);
  }

  @Post("/file", multer.single("file"))
  async postFile(@FromFile() file: Express.Multer.File) {
    return Responses.OK(file.filename);
  }
}
