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

const roleCountMock = jest.fn();
const roleFindManyMock = jest.fn();

mock.module("../../lib/prisma", () => ({
  default: {
    role: {
      count: roleCountMock,
      findMany: roleFindManyMock,
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  },
}));

describe("roles router - search query handling", () => {
  let rolesRouter: Hono;

  beforeAll(async () => {
    ({ rolesRouter } = await import("./role.route"));
  });

  beforeEach(() => {
    roleCountMock.mockImplementation(async (args?: PrismaArgs) => {
      assertNoUndefinedContains(args);
      return 1;
    });

    roleFindManyMock.mockImplementation(async (args?: PrismaArgs) => {
      assertNoUndefinedContains(args);
      return [
        {
          id: "role-1",
          name: "Admin",
          permission: ["*"],
        },
      ];
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    roleCountMock.mockReset();
    roleFindManyMock.mockReset();
  });

  it("returns roles without requiring search parameter", async () => {
    const request = new Request("http://test.local/?limit=10&page=1", {
      method: "GET",
    });

    const response = await rolesRouter.fetch(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        message: "Roles fetched successfully",
        data: expect.objectContaining({
          total: 1,
          items: expect.arrayContaining([
            expect.objectContaining({
              id: "role-1",
              name: "Admin",
              permission: ["*"],
            }),
          ]),
        }),
      })
    );

    expect(roleCountMock).toHaveBeenCalledWith({ where: undefined });
    expect(roleFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined,
      })
    );
  });
});
