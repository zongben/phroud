import { IEventHandler, Subscribe } from "../../../../src/mediator";
import { LoginFailedEvent } from "../use-case/command/login/events/loginFailed.event";

@Subscribe(LoginFailedEvent)
export class SendEmail implements IEventHandler<LoginFailedEvent> {
  async handle(event: LoginFailedEvent): Promise<void> {
    console.log(
      `account:${event.account} login failed, email handler executed`,
    );
  }
}
