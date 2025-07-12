import { ErrorResult } from "./result.type";

export class ErrorReturn<E> implements ErrorResult<E> {
  isSuccess: false;
  error: E;

  constructor(err: E) {
    this.isSuccess = false;
    this.error = err;
  }
}
