import { OkResult } from "./result.type";

export class OkReturn<T> implements OkResult<T> {
  isSuccess: true;
  data: T;

  constructor(data: T) {
    this.isSuccess = true;
    this.data = data;
  }
}
