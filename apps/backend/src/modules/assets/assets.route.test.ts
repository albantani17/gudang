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

const assetCountMock = jest.fn();
const assetFindManyMock = jest.fn();

mock.module("../../lib/prisma", () => ({
  default: {
    asset: {
      count: assetCountMock,
      findMany: assetFindManyMock,
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    assetBroken: {
      create: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    assetArea: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe("assets router - search query handling", () => {
  let assetsRouter: Hono;

  beforeAll(async () => {
    ({ assetsRouter } = await import("./assets.route"));
  });

  beforeEach(() => {
    assetCountMock.mockImplementation(async (args?: PrismaArgs) => {
      assertNoUndefinedContains(args);
      return 1;
    });

    const now = new Date("2024-02-01T00:00:00.000Z");
    assetFindManyMock.mockImplementation(async (args?: PrismaArgs) => {
      assertNoUndefinedContains(args);
      return [
        {
          id: "asset-1",
          serialNumber: "SER-1",
          macAddress: "00:11:22:33:44:55",
          serviceType: "HOTSPOT",
          ownerAsset: "PERUSAHAAN",
          orderDate: now,
          technician: "Technician",
          latitude: 0,
          longitude: 0,
          description: null,
          createdAt: now,
          updatedAt: now,
          product: {
            id: "prod-1",
            name: "Router",
            code: "PART-1",
            createdAt: now,
            updatedAt: now,
          },
          assetArea: {
            id: "area-1",
            name: "Area 1",
            code: "AREA-1",
            createdAt: now,
            updatedAt: now,
          },
          assetBroken: null,
        },
      ];
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    assetCountMock.mockReset();
    assetFindManyMock.mockReset();
  });

  it("returns assets list when search is omitted", async () => {
    const request = new Request("http://test.local/?limit=10&page=1", {
      method: "GET",
    });

    const response = await assetsRouter.fetch(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        message: "Assets fetched successfully",
        data: expect.objectContaining({
          total: 1,
          items: expect.arrayContaining([
            expect.objectContaining({
              id: "asset-1",
              serialNumber: "SER-1",
            }),
          ]),
        }),
      })
    );

    expect(assetCountMock).toHaveBeenCalledWith({ where: undefined });
    expect(assetFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: undefined,
      })
    );
  });
});
