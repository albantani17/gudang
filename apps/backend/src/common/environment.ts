import { AppError } from "./errors";

export const ENV = () => {
  const JWT_sECRET = process.env.JWT_SECRET;
  if (!JWT_sECRET) {
    throw new AppError("INTERNAL", 500, "JWT_SECRET is not defined");
  }
  return {
    JWT_sECRET,
  };
};
