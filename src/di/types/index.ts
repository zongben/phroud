import { Newable } from "inversify";

export type ContainerScope = "singleton" | "request" | "transient" | "constant";

export type ContainerModule = {
  scope: ContainerScope;
  type: symbol;
  constructor: Newable;
};
