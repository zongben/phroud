import { AsyncLocalStorage } from "node:async_hooks";
import { Timer } from "./timer";

export const timerStorage = new AsyncLocalStorage<Timer>();

export function TrackClassMethods(): ClassDecorator {
  return (target: any) => {
    const methodNames = Object.getOwnPropertyNames(target.prototype).filter(
      (name) =>
        name !== "constructor" && typeof target.prototype[name] === "function",
    );

    for (const name of methodNames) {
      const original = target.prototype[name];

      target.prototype[name] = function (...args: any[]) {
        const timer = timerStorage.getStore();
        const label = `${target.name}.${name}`;
        const id = timer?.start(label) ?? -1;

        try {
          const result = original.apply(this, args);
          return result instanceof Promise
            ? result.finally(() => timer?.end(id))
            : (timer?.end(id), result);
        } catch (err) {
          timer?.end(id);
          throw err;
        }
      };
    }
  };
}

export function TrackMethod(): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const isStatic = typeof target === "function";
      const className = isStatic
        ? target.name
        : (target.constructor?.name ?? "Function");
      const timer = timerStorage.getStore();
      const label = `${className}.${String(propertyKey)}`;
      const id = timer?.start(label) ?? -1;

      try {
        const result = original.apply(this, args);
        return result instanceof Promise
          ? result.finally(() => timer?.end(id))
          : (timer?.end(id), result);
      } catch (err) {
        timer?.end(id);
        throw err;
      }
    };

    return descriptor;
  };
}
