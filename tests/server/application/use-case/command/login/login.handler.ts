import { inject } from "../../../../../../src/di";
import { IJwTokenHelper } from "../../../../../../src/jwt";
import { HandleFor, IReqHandler } from "../../../../../../src/mediator";
import { ErrorReturn, OkReturn, Result } from "../../../../../../src/result";
import { TrackClassMethods } from "../../../../../../src/utils";
import { AccessTokenSymbol, RefreshTokenSymbol } from "../../../../infra/jwt";
import { UserRepository } from "../../../../infra/repository/user.repository";
import { ErrorCodes } from "../../../error-codes";
import { IUserRepository } from "../../../persistence/user.repository";
import { LoginCommand } from "./login.command";
import { LoginError, LoginResult } from "./login.result";

@HandleFor(LoginCommand)
@TrackClassMethods()
export class LoginHandler
  implements IReqHandler<LoginCommand, Result<LoginResult, LoginError>>
{
  constructor(
    // @inject(MEDIATOR_TYPES.IPublisher) private _publisher: IPublisher,
    @inject(UserRepository) private _userRepository: IUserRepository,
    @inject(AccessTokenSymbol)
    private _accessTokenHelper: IJwTokenHelper,
    @inject(RefreshTokenSymbol)
    private _refreshTokenHelper: IJwTokenHelper,
  ) {}

  async handle(req: LoginCommand): Promise<Result<LoginResult, LoginError>> {
    const user = await this._userRepository.getByAccount(req.account);
    if (!user)
      return new ErrorReturn<LoginError>(
        ErrorCodes.ACCOUNT_OR_PASSWORD_INCORRECT,
      );

    const isPasswordCorrect = await user.isPasswordCorrect(req.password);
    if (!isPasswordCorrect) {
      // await this._publisher.publish(new LoginFailedEvent(req.account));
      return new ErrorReturn(ErrorCodes.ACCOUNT_OR_PASSWORD_INCORRECT);
    }

    const accessToken = this._accessTokenHelper.generateToken({
      userid: user.id,
      account: user.account,
      username: user.username,
    });

    const refreshToken = this._refreshTokenHelper.generateToken({
      userid: user.id,
    });
    return new OkReturn({
      accessToken,
      refreshToken,
    });
  }
}
