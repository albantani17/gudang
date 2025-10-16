import { describe, expect, it, jest, mock } from "bun:test";
import { authMiddleware } from "./auth.middleware";
import { Context } from "hono";
import { RequestHeader } from "hono/utils/headers";
import { AppError } from "../common/errors";
import { JwtTokenInvalid } from "hono/utils/jwt/types";

mock.module("hono/jwt", () => ({
  verify: jest.fn(async (token: string, _secret: unknown) => {
    // terima "valid-token" saja
    if (token === "valid-token") {
      return {
        id: 1,
        email: "aGtHq@example.com",
        username: "username",
        roleId: 1,
        exp: Math.floor(Date.now() / 1000) + 900,
      };
    }
    throw new JwtTokenInvalid("invalid token");
  }),
}));

mock.module("../common/environment", () => ({
  ENV: () => ({
    JWT_sECRET: "secret",
  }),
}));


function makeMockCtx({
  path = "/api/users",
  authHeader = "Bearer valid-token",
}: {
  path?: string;
  authHeader?: string;
}) {
  const ctx = {
    // yang kamu pakai di middleware
    req: {
      path,
      header: (_: RequestHeader) => authHeader,
    },
    set: jest.fn(),
    get: jest.fn(),

    // properti tambahan biar TS gak protes
    env: {} as any,
    finalized: false,
    error: undefined as unknown as Error | undefined,
    event: {} as any,
    // boleh tambahkan properti lain kalau nanti dibutuhkan
  };

  return ctx as unknown as Context;
}

describe("auth middleware", () => {
  it("should allow public endpoints", () => {
    const mockContext = {
      req: {
        path: "/api/auth/login",
      },
      set: jest.fn(),
    };
    const mockNext = jest.fn();
    authMiddleware(mockContext as any, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if no token is provided", async () => {
    const mockContext = makeMockCtx({authHeader: ""});
    const mockNext = jest.fn();
    expect(
      authMiddleware(mockContext as Context, mockNext)
    ).rejects.toBeInstanceOf(AppError);
    expect(
      authMiddleware(mockContext as Context, mockNext)
    ).rejects.toMatchObject({
      status: 401,
    });
  });

  it("should throw an error if the token is invalid", async () => {
    const mockContext = makeMockCtx({authHeader: "Bearer invalid-token"});
    const mockNext = jest.fn();
    expect(
      authMiddleware(mockContext as Context, mockNext)
    ).rejects.toBeInstanceOf(AppError);
    expect(
      authMiddleware(mockContext as Context, mockNext)
    ).rejects.toMatchObject({
      status: 401,
    });
  });

  it("should call next if the token is valid", async () => {
    const mockContext = makeMockCtx({authHeader: "Bearer valid-token"});
    const mockNext = jest.fn();
    await authMiddleware(mockContext as Context, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
