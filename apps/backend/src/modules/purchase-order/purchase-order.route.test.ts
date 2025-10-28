import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  mock,
} from "bun:test";
import { AppError } from "../../common/errors";

mock.module("../../generated/prisma", () => ({
  __esModule: true,
  PrismaClient: jest.fn(() => ({})),
}));

mock.module("@hono/zod-validator", () => ({
  zValidator:
    (type: "json" | "query" | "param", schema: any, onError?: any) =>
    async (c: any, next: () => Promise<Response | void>) => {
      try {
        let input: Record<string, unknown> = {};

        if (type === "json") {
          input = await c.req.json();
          if (typeof input.deliveryDate === "string") {
            input.deliveryDate = new Date(input.deliveryDate);
          }
          if (typeof input.paymentDate === "string") {
            input.paymentDate = new Date(input.paymentDate);
          }
        } else if (type === "query") {
          const url = new URL(c.req.url);
          input = Object.fromEntries(url.searchParams.entries());
        } else if (type === "param") {
          input = c.req.param();
        }

        const parsed = await schema.safeParseAsync(input);

        if (!parsed.success) {
          if (onError) {
            return onError(parsed, c);
          }
          throw parsed.error;
        }

        const previousValid = c.req.valid?.bind(c.req);
        const data = parsed.data;

        c.req.valid = (selector: string) => {
          if (selector === type) {
            return data;
          }
          if (previousValid) {
            return previousValid(selector);
          }
          throw new Error(`No validated data for ${selector}`);
        };

        return next();
      } catch (error) {
        if (onError) {
          return onError(
            {
              success: false,
              error,
            },
            c
          );
        }
        throw error;
      }
    },
}));

type PurchaseOrdersRouter = typeof import("./purchase-order.route")["purchaseOrdersRouter"];
type PurchaseOrderServices = typeof import("./purchase-order.service")["purchaseOrderServices"];

let router: PurchaseOrdersRouter;
let services: PurchaseOrderServices;

beforeAll(async () => {
  ({ purchaseOrderServices: services } = await import("./purchase-order.service"));
  ({ purchaseOrdersRouter: router } = await import("./purchase-order.route"));
});

afterAll(() => {
  mock.restore();
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.restoreAllMocks();
});

const baseDates = {
  deliveryDate: new Date("2024-02-01T00:00:00.000Z"),
  paymentDate: new Date("2024-02-05T00:00:00.000Z"),
  createdAt: new Date("2024-02-10T00:00:00.000Z"),
};

const samplePurchaseOrder = {
  id: "9b4e8430-1a05-4da3-9d08-92c6aea1c0d5",
  orderNumber: "PO-2024-001",
  deliveryDate: baseDates.deliveryDate,
  paymentDate: baseDates.paymentDate,
  description: "First order",
  isUsePpn: true,
  ppn: 11,
  totalPrice: 100000,
  createdAt: baseDates.createdAt,
  supplier: {
    id: "3bc5414d-430a-4875-b1eb-d3f9aea591fb",
    name: "Supplier First",
    address: "Jl. Melati",
    contact: "08121234567",
  },
  purchaseLists: [
    {
      id: "ae8f0885-ba75-4b81-8bff-12602d7495d9",
      productId: "1aab82d2-0a03-4c92-82da-f935a7e3716a",
      basePrice: 50000,
      amount: 2,
      totalPrice: 100000,
    },
  ],
};

describe("purchaseOrdersRouter POST /", () => {
  it("creates a purchase order and returns the payload", async () => {
    const createSpy = jest
      .spyOn(services, "create")
      .mockResolvedValueOnce(samplePurchaseOrder);

    const response = await router.request("/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderNumber: samplePurchaseOrder.orderNumber,
        deliveryDate: baseDates.deliveryDate.toISOString(),
        paymentDate: baseDates.paymentDate.toISOString(),
        description: samplePurchaseOrder.description,
        supplierId: samplePurchaseOrder.supplier.id,
        isUsePpn: samplePurchaseOrder.isUsePpn,
        ppn: samplePurchaseOrder.ppn,
        totalPrice: samplePurchaseOrder.totalPrice,
        purchaseLists: samplePurchaseOrder.purchaseLists.map(
          ({ productId, basePrice, amount, totalPrice }) => ({
            productId,
            basePrice,
            amount,
            totalPrice,
          })
        ),
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toEqual({
      data: JSON.parse(JSON.stringify(samplePurchaseOrder)),
      message: "Purchase order created successfully",
    });

    const callArg = createSpy.mock.calls[0]?.[0];
    expect(callArg).toMatchObject({
      orderNumber: samplePurchaseOrder.orderNumber,
      supplierId: samplePurchaseOrder.supplier.id,
      isUsePpn: samplePurchaseOrder.isUsePpn,
      ppn: samplePurchaseOrder.ppn,
    });
    expect(callArg.deliveryDate).toBeInstanceOf(Date);
    expect(callArg.paymentDate).toBeInstanceOf(Date);
  });

  it("returns validation errors when payload is invalid", async () => {
    const createSpy = jest
      .spyOn(services, "create")
      .mockResolvedValue(samplePurchaseOrder);
    const response = await router.request("/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        // missing orderNumber to trigger validation failure
        deliveryDate: baseDates.deliveryDate.toISOString(),
        paymentDate: baseDates.paymentDate.toISOString(),
        supplierId: "not-a-uuid",
        isUsePpn: true,
        ppn: 11,
        totalPrice: 100000,
        purchaseLists: [],
      }),
    });

    expect(response.status).toBe(400);
    const body = await response.json();

    expect(body.error).toBe("VALIDATION_ERROR");
    expect(Array.isArray(body.message)).toBe(true);
    expect(createSpy).not.toHaveBeenCalled();
  });
});

describe("purchaseOrdersRouter GET /", () => {
  it("returns a paginated purchase order list", async () => {
    const listPayload = {
      items: [samplePurchaseOrder],
      total: 1,
      pagination: {
        limit: 5,
        currentPage: 1,
        totalPages: 1,
      },
    };

    const findSpy = jest
      .spyOn(services, "find")
      .mockResolvedValueOnce(listPayload);

    const response = await router.request(
      "/?limit=5&page=1&search=2024-001",
      {
        method: "GET",
      }
    );

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toEqual({
      data: {
        ...listPayload,
        items: JSON.parse(JSON.stringify(listPayload.items)),
      },
      message: "Purchase orders fetched successfully",
    });

    const [queryArg] = findSpy.mock.calls[0];
    expect(queryArg).toMatchObject({
      limit: 5,
      page: 1,
      search: "2024-001",
    });
  });
});

describe("purchaseOrdersRouter GET /:id", () => {
  it("returns a single purchase order", async () => {
    const findOneSpy = jest
      .spyOn(services, "findOne")
      .mockResolvedValueOnce(samplePurchaseOrder);

    const response = await router.request(`/${samplePurchaseOrder.id}`, {
      method: "GET",
    });

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toEqual({
      data: JSON.parse(JSON.stringify(samplePurchaseOrder)),
      message: "Purchase order fetched successfully",
    });

    expect(findOneSpy).toHaveBeenCalledWith(samplePurchaseOrder.id);
  });

  it("returns validation error for invalid id param", async () => {
    const findOneSpy = jest
      .spyOn(services, "findOne")
      .mockResolvedValue(samplePurchaseOrder);
    const response = await router.request("/invalid-id", {
      method: "GET",
    });

    expect(response.status).toBe(400);
    const body = await response.json();

    expect(body.error).toBe("VALIDATION_ERROR");
    expect(findOneSpy).not.toHaveBeenCalled();
  });
});

describe("purchaseOrdersRouter DELETE /:id", () => {
  it("deletes a purchase order", async () => {
    const deleteSpy = jest
      .spyOn(services, "delete")
      .mockResolvedValueOnce(samplePurchaseOrder);

    const response = await router.request(`/${samplePurchaseOrder.id}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toEqual({
      data: JSON.parse(JSON.stringify(samplePurchaseOrder)),
      message: "Purchase order deleted successfully",
    });

    expect(deleteSpy).toHaveBeenCalledWith(samplePurchaseOrder.id);
  });

  it("propagates service errors", async () => {
    jest.spyOn(services, "delete").mockRejectedValueOnce(
      new AppError("NOT_FOUND", 404, "Purchase order not found")
    );

    const response = await router.request(`/${samplePurchaseOrder.id}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(404);
    const body = await response.json();

    expect(body).toEqual({
      error: "NOT_FOUND",
      message: "Purchase order not found",
    });
  });
});
