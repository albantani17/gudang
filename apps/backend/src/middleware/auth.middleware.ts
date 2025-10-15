import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { ENV } from "../common/environment";

const PUBLIC_ENDPOINTS = ["/auth/login"];

export type UserPayload = {
  sub: string;
  email: string;
  username: string;
} 

export const authMiddleware = async (c: Context, next: Next) => {
  const { path } = c.req;

  if (PUBLIC_ENDPOINTS.includes(path)) {
    return next();
  }

  const token = c.req.header("Authorization");

  if (!token) {
    return c.json({ error: "UNAUTHORIZED", message: "Unauthorized" }, 401);
  }

  const [prefix, tokenValue] = token.split(" ");

  if (prefix !== "Bearer") {
    return c.json({ error: "UNAUTHORIZED", message: "Unauthorized" }, 401);
  }

  const payload = await verify(tokenValue, ENV().JWT_sECRET);

  c.set("user", payload);
  return next();
};
