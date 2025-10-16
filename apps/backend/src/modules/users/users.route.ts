import { Hono } from "hono";
import { CreateUserBody, UpdateUserBody, UserIdParam } from "./users.schema";
import { zValidator } from "@hono/zod-validator";
import { usersService } from "./users.service";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import { zodValidationErrorHandler } from "../../common/errors";

export const usersRouter = new Hono();

usersRouter.post(
  "/",
  zValidator("json", CreateUserBody, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await usersService.create(body);
    return c.json({ data: result, message: "User created successfully" });
  }
);

usersRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await usersService.find(pagination);
    return c.json({ data: result, message: "Users fetched successfully" });
  }
);

usersRouter.get(
  "/:id",
  zValidator("param", UserIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await usersService.findOne(id);
    return c.json({ data: result, message: "User fetched successfully" });
  }
);

usersRouter.put(
  "/:id",
  zValidator("param", UserIdParam, zodValidationErrorHandler),
  zValidator("json", UpdateUserBody, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await usersService.update(id, body);
    return c.json({ data: result, message: "User updated successfully" });
  }
);

usersRouter.delete(
  "/:id",
  zValidator("param", UserIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await usersService.delete(id);
    return c.json({ data: result, message: "User deleted successfully" });
  }
);
