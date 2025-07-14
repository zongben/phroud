import "dotenv/config";
import "winston-daily-rotate-file";
import DailyRotateFile from "winston-daily-rotate-file";
import { ILogger } from "./interfaces";
export declare enum LOGGER_LEVEL {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
}
export declare class Logger implements ILogger {
    private logger;
    constructor(level?: LOGGER_LEVEL, options?: DailyRotateFile.DailyRotateFileTransportOptions);
    error(err: Error): void;
    warn(message: string): void;
    info(message: string): void;
    debug(message: string): void;
}
//# sourceMappingURL=index.d.ts.map