import { RawData } from "ws";
import { WebSocket } from "../../../src/controller";
import { IWebSocket, IWsContext } from "../../../src/controller/interfaces";
import { ILoggerSymbol } from "../../../src/app";
import { ILogger } from "../../../src/logger";
import { inject } from "../../../src/di";

@WebSocket("/notification")
export class NotificationWebSocket implements IWebSocket {
  constructor(@inject(ILoggerSymbol) private logger: ILogger) {}

  onMessage(
    ctx: IWsContext,
    data: RawData,
    isBinary: boolean,
  ): void | Promise<void> {
    this.logger.debug(`notification web socket send:${data}`);
    // throw new Error("ws error test");
    ctx.send(`response from server your data:${data}, isBinary:${isBinary}`);
  }
}
