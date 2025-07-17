import { inject } from "inversify";
import { IEventHandler, Subscribe } from "../../../../src/mediator";
import { LoginFailedEvent } from "../use-case/command/login/events/loginFailed.event";
import { ILoggerSymbol } from "../../../../src/app";
import { ILogger } from "../../../../src/logger";

@Subscribe(LoginFailedEvent)
export class SendEmail implements IEventHandler<LoginFailedEvent> {
  constructor(@inject(ILoggerSymbol) private logger: ILogger) {}
  async handle(event: LoginFailedEvent): Promise<void> {
    this.logger.debug(
      `account:${event.account} login failed, email handler executed`,
    );
  }
}
