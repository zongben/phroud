"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LOGGER_LEVEL = void 0;
const winston_1 = __importDefault(require("winston"));
require("dotenv/config");
require("winston-daily-rotate-file");
var LOGGER_LEVEL;
(function (LOGGER_LEVEL) {
    LOGGER_LEVEL["DEBUG"] = "debug";
    LOGGER_LEVEL["INFO"] = "info";
    LOGGER_LEVEL["WARN"] = "warn";
    LOGGER_LEVEL["ERROR"] = "error";
})(LOGGER_LEVEL || (exports.LOGGER_LEVEL = LOGGER_LEVEL = {}));
class Logger {
    constructor(level = LOGGER_LEVEL.INFO, options = {
        filename: `./log/%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
    }) {
        if (!level) {
            throw new Error("level is required");
        }
        const transport = new winston_1.default.transports.DailyRotateFile(options);
        this.logger = winston_1.default.createLogger({
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({
                format: "YYYY-MM-DD HH:mm:ss",
            }), winston_1.default.format.printf(({ timestamp, level, message }) => {
                return `${timestamp} [${level}] ${message}`;
            })),
            level,
            transports: [transport, new winston_1.default.transports.Console()],
        });
    }
    error(err) {
        this.logger.error(err.stack || err.message);
    }
    warn(message) {
        this.logger.warn(message);
    }
    info(message) {
        this.logger.info(message);
    }
    debug(message) {
        this.logger.debug(message);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=index.js.map