import {
  FromBody,
  Controller,
  Get,
  Post,
  Responses,
  Guard,
  FromQuery,
  FromParam,
  Multipart,
} from "../../../src/controller";
import { ApiDoc, MediatedController } from "../../../src";
import { matchResult } from "../../../src";
import { validate } from "../../../src";
import { LoginCommand } from "../application/use-case/command/login/login.command";
import { LoginReq, LoginRule } from "../contract/auth/login";
import { ErrorBody } from "./error-body";
import { ErrorCodes } from "../application/error-codes";
import {
  RegisterReq,
  RegisterRes,
  RegisterRule,
} from "../contract/auth/register";
import { RegisterCommand } from "../application/use-case/command/register/register.command";
import { inject } from "inversify";
import { ScopeTest, ScopeTestSymbol } from "../domain/user/user.root";
import { createMulter, uploader } from "../../../src";
import { AsyncTestMiddleware } from "../middleware";
import { Track } from "../../../src";
import { UploadFile } from "../contract/auth/file";

const storage: uploader.DiskStorageOptions = {
  destination: `${process.cwd()}/tests/upload_test/`,
};

const multer = createMulter(storage);

@Track()
@Guard("none")
@Controller("/auth")
export class AuthController extends MediatedController {
  constructor(@inject(ScopeTestSymbol) private readonly _scopeTest: ScopeTest) {
    super();
  }

  @ApiDoc({
    summary: "會員註冊",
    description: "會員註冊詳細說明",
    tags: ["Auth"],
    requestBody: [RegisterReq],
    responses: {
      201: { description: "回傳內容", content: RegisterReq },
      409: { description: "錯誤訊息", content: ErrorBody },
    },
  })
  @Post("/register", validate(RegisterRule))
  async register(@FromBody() req: RegisterReq) {
    console.log("from controller: ", this._scopeTest.index);
    this._scopeTest.index++;
    console.log("and add one in controller: ", this._scopeTest.index);

    const command = new RegisterCommand(req);
    const result = await this.dispatch(command);
    return matchResult(result, {
      ok: (v) => {
        return Responses.Created<RegisterRes>({
          account: v.account,
          username: v.username,
        });
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

  @ApiDoc({
    tags: ["Auth"],
    params: [
      {
        name: "id",
        description: "使用者id",
      },
    ],
    query: [
      {
        name: "token",
        description: "token認證",
      },
    ],
  })
  @Get("/room/:id")
  async getId(@FromQuery("token") token: any, @FromParam("id") id: any) {
    return Responses.OK({
      id,
      token,
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

  @ApiDoc({
    tags: ["Auth"],
    responses: {
      200: { description: "return a file", content: "binary" },
    },
  })
  @Get("/file")
  async getFile() {
    return Responses.File("test.txt", `tests/assets/test.txt`);
  }

  @ApiDoc({
    tags: ["Auth"],
    contentType: "multipart/form-data",
    requestBody: UploadFile,
  })
  @Post("/file", multer.array("photos"))
  async postFile(@Multipart(["photos"]) multi: UploadFile) {
    console.log(multi);
    return Responses.OK({ title: multi.title });
  }
}
