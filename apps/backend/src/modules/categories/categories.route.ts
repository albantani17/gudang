import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CategoryIdParam, CreateCategory } from "./categories.schema";
import { categoriesServices } from "./categories.service";
import { zodValidationErrorHandler } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";

export const categoriesRouter = new Hono();

categoriesRouter.post(
  "/",
  zValidator("json", CreateCategory, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await categoriesServices.create(body);
    return c.json({ data: result, message: "Category created successfully" });
  }
);

categoriesRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await categoriesServices.find(pagination);
    return c.json({ data: result, message: "Categories fetched successfully" });
  }
);

categoriesRouter.get(
  "/:id",
  zValidator("param", CategoryIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await categoriesServices.findOne(id);
    return c.json({ data: result, message: "Category fetched successfully" });
  }
);

categoriesRouter.put(
  "/:id",
  zValidator("param", CategoryIdParam, zodValidationErrorHandler),
  zValidator("json", CreateCategory, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await categoriesServices.update(id, body);
    return c.json({ data: result, message: "Category updated successfully" });
  }
);

categoriesRouter.delete(
  "/:id",
  zValidator("param", CategoryIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await categoriesServices.delete(id);
    return c.json({ data: result, message: "Category deleted successfully" });
  }
);
