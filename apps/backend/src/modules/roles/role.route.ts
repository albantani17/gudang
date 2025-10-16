import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateRole, RoleIdParam } from "./roles.schema";
import { rolesService } from "./roles.service";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import { zodValidationErrorHandler } from "../../common/errors";

export const rolesRouter = new Hono();

rolesRouter.post(
  "/",
  zValidator("json", CreateRole, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await rolesService.create(body);
    return c.json({ data: result, message: "Role created successfully" });
  }
);

rolesRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await rolesService.find(pagination);
    return c.json({ data: result, message: "Roles fetched successfully" });
  }
);

rolesRouter.get(
  "/:id",
  zValidator("param", RoleIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await rolesService.findOne(id);
    return c.json({ data: result, message: "Role fetched successfully" });
  }
);

rolesRouter.put(
  "/:id",
  zValidator("param", RoleIdParam, zodValidationErrorHandler),
  zValidator("json", CreateRole, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await rolesService.update(id, body);
    return c.json({ data: result, message: "Role updated successfully" });
  }
);

rolesRouter.delete(
  "/:id",
  zValidator("param", RoleIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await rolesService.delete(id);
    return c.json({ data: result, message: "Role deleted successfully" });
  }
);
