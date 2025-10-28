import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  CreateWareHouse,
  UpdateWareHouse,
  WareHouseIdParam,
} from "./ware-houses.schema";
import { zodValidationErrorHandler } from "../../common/errors";
import { WarehouseService } from "./ware-houses.service";
import { PaginationQuery } from "../../common/schema/pagination.schema";

export const wareHousesRouter = new Hono();
const warehouseServices = new WarehouseService();

wareHousesRouter.post(
  "/",
  zValidator("json", CreateWareHouse, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await warehouseServices.create(body);
    return c.json({ data: result, message: "WareHouse created successfully" });
  }
);

wareHousesRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await warehouseServices.find(pagination);
    return c.json({ data: result, message: "WareHouses fetched successfully" });
  }
);

wareHousesRouter.get(
  "/:id",
  zValidator("param", WareHouseIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await warehouseServices.findOne(id);
    return c.json({ data: result, message: "WareHouse fetched successfully" });
  }
);

wareHousesRouter.put(
  "/:id",
  zValidator("param", WareHouseIdParam, zodValidationErrorHandler),
  zValidator("json", UpdateWareHouse, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await warehouseServices.update(id, body);
    return c.json({ data: result, message: "WareHouse updated successfully" });
  }
);

wareHousesRouter.delete(
  "/:id",
  zValidator("param", WareHouseIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await warehouseServices.delete(id);
    return c.json({ data: result, message: "WareHouse deleted successfully" });
  }
);
