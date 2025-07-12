export interface IEventHandler<T> {
  handle(event: T): Promise<void>;
}
