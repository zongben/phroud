import { body, createRule } from "../../../../../src/validator";
import { ErrorBody } from "../../../controller/error-body";
import { INVALID_CODES } from "../../invalid-codes";

export type RegisterReq = {
  account: string;
  password: string;
  username: string;
};

export const RegisterRule = createRule<RegisterReq>((key) => {
  return [
    body(key("account"))
      .notEmpty()
      .withMessage(
        new ErrorBody({
          errorCode: INVALID_CODES.ACCOUNT_IS_REQUIRED,
          message: "Account is required",
        }),
      ),
    body(key("password"))
      .notEmpty()
      .withMessage(
        new ErrorBody({
          errorCode: INVALID_CODES.PASSWORD_IS_REQUIRED,
          message: "Password is required",
        }),
      )
      .isLength({ min: 6 })
      .withMessage(
        new ErrorBody({
          errorCode: INVALID_CODES.PASSWORD_IS_TOO_SHORT,
          message: "Password must be at least 6 characters long",
        }),
      ),
    body(key("username"))
      .notEmpty()
      .withMessage(
        new ErrorBody({
          errorCode: INVALID_CODES.USERNAME_IS_REQUIRED,
          message: "Username is required",
        }),
      ),
  ];
});
