export type errorBody = {
  errorCode: string;
  message?: string;
};

export class ErrorBody {
  errorCode: string;
  message?: string;

  constructor(body: errorBody) {
    this.errorCode = body.errorCode;
    this.message = body.message;
  }
}
