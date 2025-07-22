import { IncomingMessage } from "http";
import { RawData } from "ws";

export interface IWebSocket {
  onConnected?(ctx: IWsContext): void | Promise<void>;

  onMessage?(
    ctx: IWsContext,
    data: RawData,
    isBinary: boolean,
  ): void | Promise<void>;

  onClose?(
    ctx: IWsContext,
    code: number,
    reason: string | Buffer,
  ): void | Promise<void>;
}

export interface IWsContext {
  req: IncomingMessage;
  send(data: string | Buffer): void;
  close(code: number, reason: string | Buffer): void;
}
