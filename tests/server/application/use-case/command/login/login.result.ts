import { ErrorCodes } from "../../../error-codes";

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
};

export type LoginError = ErrorCodes.ACCOUNT_OR_PASSWORD_INCORRECT;
