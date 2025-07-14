import { ErrorResult, OkResult, Result } from "./types";
export declare class ErrorReturn<E> implements ErrorResult<E> {
    isSuccess: false;
    error: E;
    constructor(err: E);
}
export declare class OkReturn<T> implements OkResult<T> {
    isSuccess: true;
    data: T;
    constructor(data: T);
}
export declare const matchResult: <T, E extends string | number | symbol, R>(result: Result<T, E>, handlers: {
    ok: (value: T) => R;
    err: Record<E, (error: E) => R>;
}) => R;
//# sourceMappingURL=index.d.ts.map