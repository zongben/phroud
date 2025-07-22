import { RawData } from "ws";
import { WebSocket } from "../../../src/controller";
import { IWebSocket, IWsContext } from "../../../src/controller/interfaces";
import { ILoggerSymbol } from "../../../src/app";
import { ILogger } from "../../../src/logger";
import { inject } from "../../../src/di";
import { IncomingMessage } from "http";

@WebSocket("/notification")
export class NotificationWebSocket implements IWebSocket {
  constructor(@inject(ILoggerSymbol) private logger: ILogger) {}

  onConnected(ctx: IWsContext, req: IncomingMessage): void | Promise<void> {
      ctx.send(`notification is connected, req:${req.url}`)
  }

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
