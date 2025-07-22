import { OneOf } from "../../../../../../src/result";
import { MediatorRequest } from "../../../../../../src/mediator";
import { RegisterError, RegisterResult } from "./register.result";

export class RegisterCommand extends MediatorRequest<
  OneOf<RegisterResult, RegisterError>
> {
  readonly account: string;
  readonly password: string;
  readonly username: string;

  constructor(props: { account: string; password: string; username: string }) {
    super();
    this.account = props.account;
    this.password = props.password;
    this.username = props.username;
  }
}
