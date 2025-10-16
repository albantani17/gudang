import { Context, Next } from "hono";
import { UserPayload } from "./auth.middleware";
import { AppError } from "../common/errors";
import { rolesService } from "../modules/roles/roles.service";

export const rbacMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path.split("/")[2];

  if (path === "auth") return next();

  const user = c.get("user") as UserPayload;
  const role = await rolesService.findOne(user.roleId);
  const permission = role.permission as string[];
  const method = c.req.method as "GET" | "POST" | "PUT" | "DELETE";

  const mapMethod = {
    GET: "read",
    POST: "create",
    PUT: "update",
    DELETE: "delete",
  };

  if (permission[0] === "*") {
    return next();
  }

  if (permission.includes(`${path}.${mapMethod[method]}`)) {
    return next();
  }

  throw new AppError("FORBIDDEN", 403, "Forbidden");
};
