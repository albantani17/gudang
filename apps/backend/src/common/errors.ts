import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import z, { ZodError } from "zod";
import { $ZodError } from "zod/v4/core";

export class AppError extends Error {
  constructor(
    public code:
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "EMAIL_TAKEN"
      | "BAD_REQUEST"
      | "INTERNAL"
      | "NOT_FOUND",
    public status = 400,
    message?: string
  ) {
    super(message ?? code);
  }
}

export function zodError(e: $ZodError) {
  return e.issues.map((issue) => ({
    path: issue.path[0],
    message: issue.message,
  }));
}

export function mapError(err: unknown) {
  if (err instanceof ZodError) {
    return {
      status: 400 as ContentfulStatusCode,
      body: { errors: zodError(err) },
    };
  }
  if (err instanceof AppError) {
    return {
      status: err.status as ContentfulStatusCode,
      body: { error: err.code },
    };
  }
  return {
    status: 500 as ContentfulStatusCode,
    body: { error: "INTERNAL", message: err },
  };
}

export function errorHandler(error: unknown, c: Context) {
  if (error instanceof AppError) {
    return c.json(
      { error: error.code, message: error.message },
      error.status as ContentfulStatusCode
    );
  }
  if (error instanceof Error) {
    return c.json({ error: "BAD_REQUEST", message: error.message }, 400);
  }
  return c.json({ error: "INTERNAL", message: "Internal server error" }, 500);
}

export function zodValidationErrorHandler(
  result: any,
  c: Context
) {
  if (!result.success) {
    return c.json(
      {
        error: "VALIDATION_ERROR",
        message: zodError(result.error),
      },
      400
    );
  }
}
