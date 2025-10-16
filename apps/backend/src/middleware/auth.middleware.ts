import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { ENV } from "../common/environment";
import { AppError } from "../common/errors";
import { JwtTokenInvalid } from "hono/utils/jwt/types";

export const PUBLIC_ENDPOINTS = ["/api/auth/login"];

export type UserPayload = {
  sub: string;
  email: string;
  username: string;
  roleId: string;
  exp: number;
};

export const authMiddleware = async (c: Context, next: Next) => {
  const { path } = c.req;

  if (PUBLIC_ENDPOINTS.includes(path)) {
    return next();
  }

  const token = c.req.header("Authorization");

  if (!token) {
    throw new AppError("UNAUTHORIZED", 401, "Unauthorized");
  }

  const [prefix, tokenValue] = token.split(" ");

  if (prefix !== "Bearer") {
    throw new AppError("UNAUTHORIZED", 401, "Unauthorized");
  }

  try {
    const payload = await verify(tokenValue, ENV().JWT_sECRET);
    c.set("user", payload);
    return next();
  } catch (error) {
    if (error instanceof JwtTokenInvalid) {
      throw new AppError("UNAUTHORIZED", 401, "Invalid Token");
    }
    throw new AppError("INTERNAL", 500, "Internal Server Error");
  }
};
