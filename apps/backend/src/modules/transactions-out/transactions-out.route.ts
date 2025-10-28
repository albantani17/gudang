import { Hono } from "hono";
import { TransactionsOutService } from "./transactions-out.service";
import { zValidator } from "@hono/zod-validator";
import {
  CreateTransactionOut,
  TransactionOutIdParam,
} from "./transactions-out.schema";
import { zodValidationErrorHandler } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";

export const transactionOutRoute = new Hono();
const transactionsOutService = new TransactionsOutService();

transactionOutRoute.post(
  "/",
  zValidator("json", CreateTransactionOut, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await transactionsOutService.create(body);
    return c.json({
      data: result,
      message: "Transaction created successfully",
    });
  }
);

transactionOutRoute.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await transactionsOutService.find(pagination);
    return c.json({
      data: result,
      message: "Transactions fetched successfully",
    });
  }
);

transactionOutRoute.get(
  "/:id",
  zValidator("param", TransactionOutIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await transactionsOutService.findOne(id);
    return c.json({
      data: result,
      message: "Transaction fetched successfully",
    });
  }
);

transactionOutRoute.delete(
  "/:id",
  zValidator("param", TransactionOutIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await transactionsOutService.remove(id);
    return c.json({
      data: result,
      message: "Transaction deleted successfully",
    });
  }
);
