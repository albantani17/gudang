import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { LoginSchema } from "./auth.schema";
import { authService } from "./auth.service";

export const authRouter = new Hono();

authRouter.post("/login", zValidator("json", LoginSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await authService.login(body.identifier, body.password);
  return c.json({ data: result, message: "User logged in successfully" });
});
