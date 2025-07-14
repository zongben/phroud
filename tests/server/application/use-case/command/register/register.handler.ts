import { inject } from "../../../../../../src/di";
import { HandleFor, IReqHandler } from "../../../../../../src/mediator";
import { ErrorReturn, OkReturn, Result } from "../../../../../../src/result";
import { hash, TrackClassMethods, uuid } from "../../../../../../src/utils";
import { UserRepository } from "../../../../infra/repository/user.repository";
import { ErrorCodes } from "../../../error-codes";
import { IUserRepository } from "../../../persistence/user.repository";
import { RegisterCommand } from "./register.command";
import { RegisterError, RegisterResult } from "./register.result";
import { UserRoot } from "../../../../domain/user/user.root";

@HandleFor(RegisterCommand)
@TrackClassMethods()
export class RegisterHandler
  implements IReqHandler<RegisterCommand, Result<RegisterResult, RegisterError>>
{
  constructor(
    @inject(UserRepository) private readonly _userRepository: IUserRepository,
  ) {}

  async handle(
    req: RegisterCommand,
  ): Promise<Result<RegisterResult, RegisterError>> {
    const isUserExist =
      (await this._userRepository.getByAccount(req.account)) !== null;
    if (isUserExist) {
      return new ErrorReturn(ErrorCodes.USER_ALREADY_EXISTS);
    }
    const hashedPassword = await hash(req.password, 10);
    const userRoot = UserRoot.create({
      id: uuid(),
      account: req.account,
      password: hashedPassword,
      username: req.username,
    });
    const user = await this._userRepository.create(userRoot);
    return new OkReturn({
      account: user.account,
      username: user.username,
    });
  }
}
