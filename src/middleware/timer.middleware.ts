import { performance } from "node:perf_hooks";
import onFinished from "on-finished";
import { Timer } from "../utils/timer";
import { timerStorage } from "../utils/tracker";
import { ILogger } from "../logger";

export function timerMiddleware(logger: ILogger) {
  return (req: any, res: any, next: any) => {
    const timer = new Timer();
    const start = performance.now();

    onFinished(res, () => {
      const end = performance.now();
      const duration = end - start;
      let msg = `Request: ${res.statusCode} ${req.method} ${req.originalUrl} - Duration: ${duration.toFixed(2)} ms`;
      const tsMsg = timer.getAllTimeSpans().map((span) => {
        const prefix = " ".repeat((span.depth ? span.depth * 3 : 0) + 28);
        return `\n${prefix}⎣__TimeSpan: ${span.duration?.toFixed(2) ?? "N/A"} ms - ${span.label}`;
      });
      msg += tsMsg.join("");
      if (duration > 1000) {
        logger.warn(msg);
      } else {
        logger.debug(msg);
      }
    });

    timerStorage.run(timer, () => {
      next();
    });
  };
}
