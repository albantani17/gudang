import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { LoginSchema } from "./auth.schema";
import { authService } from "./auth.service";
import { UserPayload } from "../../middleware/auth.middleware";

export const authRouter = new Hono<{ Variables: { user: UserPayload } }>();

authRouter.post("/login", zValidator("json", LoginSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await authService.login(body.identifier, body.password);
  return c.json({ data: result, message: "User logged in successfully" });
});

authRouter.get("/me", async (c) => {
  const user = c.get("user");
  const result = await authService.me(user as UserPayload);
  return c.json({ data: result, message: "User fetched successfully" });
});
