import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  mock,
} from "bun:test";
import type { Hono } from "hono";

type PrismaArgs = Record<string, unknown>;

function assertNoUndefinedContains(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return;
  }

  if (
    "contains" in (payload as Record<string, unknown>) &&
    (payload as Record<string, unknown>).contains === undefined
  ) {
    throw new Error("Search filter received undefined");
  }

  for (const value of Object.values(payload as PrismaArgs)) {
    if (Array.isArray(value)) {
      value.forEach(assertNoUndefinedContains);
    } else {
      assertNoUndefinedContains(value);
    }
  }
}

const userCountMock = jest.fn();
const userFindManyMock = jest.fn();

mock.module("../../lib/prisma", () => ({
  default: {
    user: {
      count: userCountMock,
      findMany: userFindManyMock,
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("users router - search query handling", () => {
  let usersRouter: Hono;

  beforeAll(async () => {
    ({ usersRouter } = await import("./users.route"));
  });

  beforeEach(() => {
    userCountMock.mockImplementation(async (args?: PrismaArgs) => {
      assertNoUndefinedContains(args);
      return 1;
    });

    const now = new Date("2024-01-01T00:00:00.000Z");
    userFindManyMock.mockImplementation(async (args?: PrismaArgs) => {
      assertNoUndefinedContains(args);
      return [
        {
          id: "user-1",
          email: "user@example.com",
          name: "Test User",
          username: "user1",
          createdAt: now,
          updatedAt: now,
          role: {
            id: "role-1",
            name: "Admin",
            permission: ["*"],
          },
        },
      ];
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    userCountMock.mockReset();
    userFindManyMock.mockReset();
  });

  it("returns a paginated response when search is omitted", async () => {
    const request = new Request(
      "http://test.local/?limit=10&page=1",
      { method: "GET" }
    );

    const response = await usersRouter.fetch(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        message: "Users fetched successfully",
        data: expect.objectContaining({
          total: 1,
          items: expect.arrayContaining([
            expect.objectContaining({
              id: "user-1",
              email: "user@example.com",
              username: "user1",
            }),
          ]),
        }),
      })
    );

    expect(userCountMock).toHaveBeenCalledTimes(1);
    expect(userFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: undefined },
      })
    );
  });
});
