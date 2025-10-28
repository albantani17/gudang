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

function zodError(e: $ZodError) {
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
      body: { error: err.code, message: err.message },
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
  result: Record<string, unknown>,
  c: Context
) {
  if (!result.success) {
    return c.json(
      {
        error: "VALIDATION_ERROR",
        message: new zodErrorHandler(result.error).zodErrortoSentence(),
      },
      400
    );
  }
}

class zodErrorHandler {
  error: unknown;
  constructor(error: unknown) {
    this.error = error;
  }
  private formatPath(path: (string | number | symbol)[]) {
    return (
      path
        .map((seg) =>
          typeof seg === "number" ? `[${seg}]` : `.${String(seg)}`
        )
        .join("")
        .replace(/^\./, "") || "root"
    );
  }

  public zodErrortoSentence(
    opts: { separator?: string; maxIssues?: number } = {}
  ): string {
    if (!(this.error instanceof ZodError)) return "Terjadi kesalahan validasi.";

    const { separator = "; ", maxIssues = Infinity } = opts;

    const message = Array.from(
      new Set(
        this.error.issues.map((issue) => {
          const where = this.formatPath(issue.path);
          return where ? `${where}: ${issue.message}` : issue.message;
        })
      )
    );

    const shown = message.slice(0, maxIssues);
    const more = message.length - shown.length;

    const sentence =
      shown.join(separator) +
      (more > 0 ? `${separator}+${more} error lain` : "");

    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }
}
