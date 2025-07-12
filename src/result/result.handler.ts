import { Result } from "./result.type";

export const matchResult = <T, E extends string | number | symbol, R>(
  result: Result<T, E>,
  handlers: {
    ok: (value: T) => R;
    err: Record<E, (error: E) => R>;
  },
): R => {
  if (result.isSuccess) {
    return handlers.ok(result.data);
  }
  const handler = handlers.err[result.error];
  if (!handler) {
    throw new Error(`Unhandled error case: ${result.error.toString()}`);
  }
  return handler(result.error);
};
