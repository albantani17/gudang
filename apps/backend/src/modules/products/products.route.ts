import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateProduct, ProductIdParam } from "./products.schema";
import { zodValidationErrorHandler } from "../../common/errors";
import { productsServices } from "./products.service";
import { PaginationQuery } from "../../common/schema/pagination.schema";

export const productsRouter = new Hono();

productsRouter.post(
  "/",
  zValidator("json", CreateProduct, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await productsServices.create(body);
    return c.json({ data: result, message: "Product created successfully" });
  }
);

productsRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await productsServices.find(pagination);
    return c.json({ data: result, message: "Products fetched successfully" });
  }
);

productsRouter.get(
  "/:id",
  zValidator("param", ProductIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await productsServices.findOne(id);
    return c.json({ data: result, message: "Product fetched successfully" });
  }
);

productsRouter.put(
  "/:id",
  zValidator("param", ProductIdParam, zodValidationErrorHandler),
  zValidator("json", CreateProduct, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await productsServices.update(id, body);
    return c.json({ data: result, message: "Product updated successfully" });
  }
);

productsRouter.delete(
  "/:id",
  zValidator("param", ProductIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await productsServices.delete(id);
    return c.json({ data: result, message: "Product deleted successfully" });
  }
);
