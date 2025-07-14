import { IEnv } from "../public/interfaces";
import { ILogger } from "../../logger";
export declare class Env implements IEnv {
    private _env;
    constructor(path: string);
    get(key: string): any;
}
export declare class AppOptions {
    routerPrefix: string;
}
export declare class Logger implements ILogger {
    error(err: Error): void;
    warn(message: string): void;
    info(message: string): void;
    debug(message: string): void;
}
//# sourceMappingURL=index.d.ts.map