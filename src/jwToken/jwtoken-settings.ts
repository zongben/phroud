import jwt from "jsonwebtoken";

export class JwTokenSettings {
  secret: string;
  options?: jwt.SignOptions;

  constructor(secret: string, options?: jwt.SignOptions) {
    this.secret = secret;
    this.options = options;
  }
}
