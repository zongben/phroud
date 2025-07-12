import { ValidationChain } from "express-validator";

export const createRule = <T>(
  handler: (key: (k: keyof T) => string) => ValidationChain[],
): ValidationChain[] => {
  return handler((k) => k as string);
};
