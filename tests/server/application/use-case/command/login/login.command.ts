import { Request } from "../../../../../../src/mediator";
import { Result } from "../../../../../../src/result";
import { LoginError, LoginResult } from "./login.result";

export class LoginCommand extends Request<Result<LoginResult, LoginError>> {
  readonly account: string;
  readonly password: string;

  constructor(props: { account: string; password: string }) {
    super();
    this.account = props.account;
    this.password = props.password;
  }
}
