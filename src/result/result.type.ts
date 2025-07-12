export type OkResult<T> = {
  isSuccess: true;
  data: T;
};

export type ErrorResult<E> = {
  isSuccess: false;
  error: E;
};

export type Result<T, E> = OkResult<T> | ErrorResult<E>;
