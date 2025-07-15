export interface ILogger {
  error(message: Error): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}
