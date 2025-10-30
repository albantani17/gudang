import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { AssetIdParam, CreateAsset, ReturnAsset } from "./assets.schema";
import { zodValidationErrorHandler } from "../../common/errors";
import { AssetService } from "./assets.service";
import { PaginationQuery } from "../../common/schema/pagination.schema";

export const assetsRouter = new Hono();
const assetsServices = new AssetService();

assetsRouter.post(
  "/",
  zValidator("json", CreateAsset, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await assetsServices.create(body);
    return c.json({ data: result, message: "Asset created successfully" });
  }
);

assetsRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await assetsServices.find(pagination);
    return c.json({ data: result, message: "Assets fetched successfully" });
  }
);

assetsRouter.get(
  "/:id",
  zValidator("param", AssetIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await assetsServices.findOne(id);
    return c.json({ data: result, message: "Asset fetched successfully" });
  }
);

assetsRouter.put(
  "/:id",
  zValidator("param", AssetIdParam, zodValidationErrorHandler),
  zValidator("json", ReturnAsset, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await assetsServices.returnAsset(id, body);
    return c.json({ data: result, message: "Asset updated successfully" });
  }
);

assetsRouter.delete(
  "/:id",
  zValidator("param", AssetIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await assetsServices.remove(id);
    return c.json({ data: result, message: "Asset deleted successfully" });
  }
);
