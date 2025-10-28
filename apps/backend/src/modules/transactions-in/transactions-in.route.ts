import { Hono } from "hono";
import { TransactionInService } from "./transactions-in.service";
import { zValidator } from "@hono/zod-validator";
import {
  CreateTransactionIn,
  TransactionIdParam,
} from "./transactions-in.schema";
import { zodValidationErrorHandler } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";

export const transactionInRoute = new Hono();
const transactionInService = new TransactionInService();

transactionInRoute.post(
  "/",
  zValidator("json", CreateTransactionIn, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await transactionInService.create(body);
    return c.json({
      data: result,
      message: "Transaction created successfully",
    });
  }
);

transactionInRoute.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await transactionInService.find(pagination);
    return c.json({
      data: result,
      message: "Transactions fetched successfully",
    });
  }
);

transactionInRoute.get(
  "/:id",
  zValidator("param", TransactionIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await transactionInService.findOne(id);
    return c.json({
      data: result,
      message: "Transaction fetched successfully",
    });
  }
);

transactionInRoute.delete(
  "/:id",
  zValidator("param", TransactionIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await transactionInService.remove(id);
    return c.json({
      data: result,
      message: "Transaction deleted successfully",
    });
  }
);
