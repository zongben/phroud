import { MediatorRequest } from "../../../../../../src/mediator";
import { OneOf } from "../../../../../../src/result";
import { LoginError, LoginResult } from "./login.result";

export class LoginCommand extends MediatorRequest<OneOf<LoginResult, LoginError>> {
  readonly account: string;
  readonly password: string;

  constructor(props: { account: string; password: string }) {
    super();
    this.account = props.account;
    this.password = props.password;
  }
}
