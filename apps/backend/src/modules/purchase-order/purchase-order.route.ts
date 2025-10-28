import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  CreatePurchaseOrder,
  PurchaseOrderIdParam,
} from "./purchase-order.schema";
import { mapError, zodValidationErrorHandler } from "../../common/errors";
import { purchaseOrderServices } from "./purchase-order.service";
import { PaginationQuery } from "../../common/schema/pagination.schema";

export const purchaseOrdersRouter = new Hono();

purchaseOrdersRouter.onError((err, c) => {
  const { status, body } = mapError(err);
  return c.json(body, status);
});

purchaseOrdersRouter.post(
  "/",
  zValidator("json", CreatePurchaseOrder, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await purchaseOrderServices.create(body);
    return c.json({
      data: result,
      message: "Purchase order created successfully",
    });
  }
);

purchaseOrdersRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await purchaseOrderServices.find(pagination);
    return c.json({
      data: result,
      message: "Purchase orders fetched successfully",
    });
  }
);

purchaseOrdersRouter.get(
  "/:id",
  zValidator("param", PurchaseOrderIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await purchaseOrderServices.findOne(id);
    return c.json({
      data: result,
      message: "Purchase order fetched successfully",
    });
  }
);

purchaseOrdersRouter.delete(
  "/:id",
  zValidator("param", PurchaseOrderIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await purchaseOrderServices.delete(id);
    return c.json({
      data: result,
      message: "Purchase order deleted successfully",
    });
  }
);
