export interface IMediatorMap {
  set(req: any, handler: any): void;
  get(req: any): any;
}
