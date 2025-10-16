import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateUnitSchema, UnitIdParam, UpdateUnitSchema } from "./units.schema";
import { unitServices } from "./units.service";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import { zodValidationErrorHandler } from "../../common/errors";

export const unitsRouter = new Hono();

unitsRouter.post(
  "/",
  zValidator("json", CreateUnitSchema, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await unitServices.create(body);
    return c.json({ data: result, message: "Unit created successfully" });
  }
);

unitsRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await unitServices.find(pagination);
    return c.json({ data: result, message: "Units fetched successfully" });
  }
);

unitsRouter.get(
  "/:id",
  zValidator("param", UnitIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await unitServices.findOne(id);
    return c.json({ data: result, message: "Unit fetched successfully" });
  }
);

unitsRouter.put(
  "/:id",
  zValidator("param", UnitIdParam, zodValidationErrorHandler),
  zValidator("json", UpdateUnitSchema, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await unitServices.update(id, body);
    return c.json({ data: result, message: "Unit updated successfully" });
  }
);

unitsRouter.delete(
  "/:id",
  zValidator("param", UnitIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await unitServices.delete(id);
    return c.json({ data: result, message: "Unit deleted successfully" });
  }
);
