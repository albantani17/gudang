import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { AssetAreaIdParam, CreateAssetArea, UpdateAssetArea } from "./asset-areas.schema";
import { assetAreasServices } from "./asset-areas.service";
import { zodValidationErrorHandler } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";

export const assetAreasRouter = new Hono();

assetAreasRouter.post(
  "/",
  zValidator("json", CreateAssetArea, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await assetAreasServices.create(body);
    return c.json({ data: result, message: "Asset area created successfully" });
  }
);

assetAreasRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await assetAreasServices.find(pagination);
    return c.json({
      data: result,
      message: "Asset areas fetched successfully",
    });
  }
);

assetAreasRouter.get(
  "/:id",
  zValidator("param", AssetAreaIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await assetAreasServices.findOne(id);
    return c.json({ data: result, message: "Asset area fetched successfully" });
  }
);

assetAreasRouter.put(
  "/:id",
  zValidator("param", AssetAreaIdParam, zodValidationErrorHandler),
  zValidator("json", UpdateAssetArea, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await assetAreasServices.update(id, body);
    return c.json({ data: result, message: "Asset area updated successfully" });
  }
);

assetAreasRouter.delete(
  "/:id",
  zValidator("param", AssetAreaIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await assetAreasServices.delete(id);
    return c.json({ data: result, message: "Asset area deleted successfully" });
  }
);
