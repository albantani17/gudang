import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { AgentIdParam, CreateAgent, UpdateAgent } from "./agents.schema";
import { zodValidationErrorHandler } from "../../common/errors";
import { agentsServices } from "./agents.service";
import { PaginationQuery } from "../../common/schema/pagination.schema";

export const agentsRouter = new Hono();

agentsRouter.post(
  "/",
  zValidator("json", CreateAgent, zodValidationErrorHandler),
  async (c) => {
    const body = c.req.valid("json");
    const result = await agentsServices.create(body);
    return c.json({ data: result, message: "Agent created successfully" });
  }
);

agentsRouter.get(
  "/",
  zValidator("query", PaginationQuery, zodValidationErrorHandler),
  async (c) => {
    const pagination = c.req.valid("query");
    const result = await agentsServices.find(pagination);
    return c.json({ data: result, message: "Agents fetched successfully" });
  }
);

agentsRouter.get(
  "/:id",
  zValidator("param", AgentIdParam, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await agentsServices.findOne(id);
    return c.json({ data: result, message: "Agent fetched successfully" });
  }
);

agentsRouter.put(
  "/:id",
  zValidator("param", AgentIdParam, zodValidationErrorHandler),
  zValidator("json", UpdateAgent, zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await agentsServices.update(id, body);
    return c.json({ data: result, message: "Agent updated successfully" });
  }
);

agentsRouter.delete(
  "/:id",
  zValidator("param", AgentIdParam  , zodValidationErrorHandler),
  async (c) => {
    const { id } = c.req.valid("param");
    const result = await agentsServices.delete(id);
    return c.json({ data: result, message: "Agent deleted successfully" });
  }
);
