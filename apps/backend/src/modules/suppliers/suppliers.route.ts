import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  CreateSupplier,
  SupplierIdParam,
  UpdateSupplier,
} from "./suppliers.schema";
import { suppliersServices } from "./suppliers.service";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import { zodValidationErrorHandler } from "../../common/errors";

export const suppliersRouter = new Hono();

suppliersRouter.post(
  "/",
  zValidator("json", CreateSupplier, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await suppliersServices.create(body);
    return c.json({ data: result, message: "Supplier created successfully" });
  }
);

suppliersRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await suppliersServices.find(pagination);
    return c.json({ data: result, message: "Suppliers fetched successfully" });
  }
);

suppliersRouter.get(
  "/:id",
  zValidator("param", SupplierIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await suppliersServices.findOne(id);
    return c.json({ data: result, message: "Supplier fetched successfully" });
  }
);

suppliersRouter.put(
  "/:id",
  zValidator("param", SupplierIdParam, zodValidationErrorHandler),
  zValidator("json", UpdateSupplier, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await suppliersServices.update(id, body);
    return c.json({ data: result, message: "Supplier updated successfully" });
  }
);

suppliersRouter.delete(
  "/:id",
  zValidator("param", SupplierIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await suppliersServices.delete(id);
    return c.json({ data: result, message: "Supplier deleted successfully" });
  }
);
