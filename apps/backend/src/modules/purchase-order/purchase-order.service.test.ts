import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  mock,
} from "bun:test";
import { AppError } from "../../common/errors";
import { CreatePurchaseOrder } from "./purchase-order.schema";

mock.restore();

let prisma: any;

const loadServices = async () =>
  (await import("./purchase-order.service")).purchaseOrderServices;

const resetPrismaMocks = () => {
  prisma.purchaseOrder = {
    findFirst: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  };
};


beforeAll(async () => {
  prisma = (await import("../../lib/prisma")).default as any;
  resetPrismaMocks();
});

const baseDates = {
  deliveryDate: new Date("2024-01-01T00:00:00.000Z"),
  paymentDate: new Date("2024-01-05T00:00:00.000Z"),
  createdAt: new Date("2024-01-10T00:00:00.000Z"),
};

const supplier = {
  id: "1f7f0bf5-6484-45c4-9d78-73b7fae3d62b",
  name: "Supplier 1",
  address: "Jl. Mawar",
  contact: "08123456789",
};

const purchaseListItem = {
  id: "5d060abe-4886-4a23-9d2a-5f4d86e6e846",
  productId: "aa949e29-51e5-4f28-9f73-3ebb8f2a9f3f",
  basePrice: 20000,
  amount: 2,
  totalPrice: 40000,
};

const samplePayload: CreatePurchaseOrder = {
  orderNumber: "PO-001",
  deliveryDate: baseDates.deliveryDate,
  paymentDate: baseDates.paymentDate,
  description: undefined,
  supplierId: "43854267-29b0-4bf0-870f-1141d80c6207",
  isUsePpn: true,
  ppn: 11,
  totalPrice: 44440,
  purchaseLists: [
    {
      productId: purchaseListItem.productId,
      basePrice: purchaseListItem.basePrice,
      amount: purchaseListItem.amount,
      totalPrice: purchaseListItem.totalPrice,
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  resetPrismaMocks();
});

describe("purchaseOrderServices.create", () => {
  it("throws when order number already exists", async () => {
    const services = await loadServices();
    prisma.purchaseOrder.findFirst.mockResolvedValueOnce({
      ...samplePayload,
      id: "existing-order",
    });

    await expect(services.create(samplePayload)).rejects.toBeInstanceOf(
      AppError
    );
    expect(prisma.purchaseOrder.create).not.toHaveBeenCalled();
  });

  it("creates a purchase order with PPN enabled", async () => {
    const services = await loadServices();
    const createdRecord = {
      id: "new-order",
      orderNumber: samplePayload.orderNumber,
      deliveryDate: baseDates.deliveryDate,
      paymentDate: baseDates.paymentDate,
      description: null,
      supplierId: samplePayload.supplierId,
      isUsePpn: true,
      ppn: samplePayload.ppn,
      totalPrice: samplePayload.totalPrice,
      createdAt: baseDates.createdAt,
      supplier,
      purchaseLists: [purchaseListItem],
    };

    prisma.purchaseOrder.findFirst.mockResolvedValueOnce(null);
    prisma.purchaseOrder.create.mockResolvedValueOnce(createdRecord);

    const result = await services.create(samplePayload);

    expect(prisma.purchaseOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orderNumber: samplePayload.orderNumber,
          ppn: samplePayload.ppn,
          purchaseLists: {
            create: [
              {
                productId: purchaseListItem.productId,
                basePrice: purchaseListItem.basePrice,
                amount: purchaseListItem.amount,
                totalPrice: purchaseListItem.totalPrice,
              },
            ],
          },
        }),
      })
    );

    expect(result).toEqual({
      id: createdRecord.id,
      orderNumber: createdRecord.orderNumber,
      deliveryDate: baseDates.deliveryDate,
      paymentDate: baseDates.paymentDate,
      description: undefined,
      isUsePpn: true,
      ppn: createdRecord.ppn,
      totalPrice: createdRecord.totalPrice,
      createdAt: baseDates.createdAt,
      supplier,
      purchaseLists: [purchaseListItem],
    });
  });

  it("sets ppn to 0 when the purchase order does not use PPN", async () => {
    const services = await loadServices();
    const payloadWithoutPpn: CreatePurchaseOrder = {
      ...samplePayload,
      isUsePpn: false,
      ppn: 99,
    };

    const createdRecord = {
      id: "new-order-without-ppn",
      orderNumber: payloadWithoutPpn.orderNumber,
      deliveryDate: baseDates.deliveryDate,
      paymentDate: baseDates.paymentDate,
      description: samplePayload.description,
      supplierId: payloadWithoutPpn.supplierId,
      isUsePpn: false,
      ppn: 0,
      totalPrice: payloadWithoutPpn.totalPrice,
      createdAt: baseDates.createdAt,
      supplier,
      purchaseLists: [purchaseListItem],
    };

    prisma.purchaseOrder.findFirst.mockResolvedValueOnce(null);
    prisma.purchaseOrder.create.mockResolvedValueOnce(createdRecord);

    const result = await services.create(payloadWithoutPpn);

    const createCall =
      prisma.purchaseOrder.create.mock.calls[0]?.[0]?.data;

    expect(createCall?.ppn).toBe(0);
    expect(result.ppn).toBe(0);
    expect(result.isUsePpn).toBe(false);
  });
});

describe("purchaseOrderServices.find", () => {
  it("returns a paginated list of purchase orders", async () => {
    const services = await loadServices();
    prisma.purchaseOrder.count.mockResolvedValueOnce(5);
    prisma.purchaseOrder.findMany.mockResolvedValueOnce([
      {
        id: "order-1",
        orderNumber: "PO-1",
        deliveryDate: baseDates.deliveryDate,
        paymentDate: baseDates.paymentDate,
        description: null,
        isUsePpn: false,
        ppn: 0,
        totalPrice: 10000,
        createdAt: baseDates.createdAt,
        supplier,
        purchaseLists: [purchaseListItem],
      },
    ]);

    const pagination = { search: "PO", limit: 2, page: 2 };

    const result = await services.find(pagination);

    expect(prisma.purchaseOrder.count).toHaveBeenCalledWith({
      where: { orderNumber: { contains: pagination.search } },
    });
    expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit,
        where: { orderNumber: { contains: pagination.search } },
      })
    );

    expect(result).toEqual({
      items: [
        {
          id: "order-1",
          orderNumber: "PO-1",
          deliveryDate: baseDates.deliveryDate,
          paymentDate: baseDates.paymentDate,
          description: undefined,
          isUsePpn: false,
          ppn: 0,
          totalPrice: 10000,
          createdAt: baseDates.createdAt,
          supplier,
          purchaseLists: [purchaseListItem],
        },
      ],
      total: 5,
      pagination: {
        limit: pagination.limit,
        currentPage: pagination.page,
        totalPages: Math.ceil(5 / pagination.limit),
      },
    });
  });
});

describe("purchaseOrderServices.findOne", () => {
  it("throws when purchase order not found", async () => {
    const services = await loadServices();
    prisma.purchaseOrder.findUnique.mockResolvedValueOnce(null);

    await expect(services.findOne("missing-id")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
      message: "Purchase order not found",
    });
  });

  it("returns a purchase order entity when found", async () => {
    const services = await loadServices();
    const record = {
      id: "order-1",
      orderNumber: "PO-1",
      deliveryDate: baseDates.deliveryDate,
      paymentDate: baseDates.paymentDate,
      description: null,
      isUsePpn: true,
      ppn: 11,
      totalPrice: 10000,
      createdAt: baseDates.createdAt,
      supplier,
      purchaseLists: [purchaseListItem],
    };

    prisma.purchaseOrder.findUnique.mockResolvedValueOnce(record);

    const result = await services.findOne(record.id);

    expect(prisma.purchaseOrder.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: record.id },
      })
    );

    expect(result).toEqual({
      ...record,
      description: undefined,
    });
  });
});

describe("purchaseOrderServices.delete", () => {
  it("deletes a purchase order and returns the previous entity", async () => {
    const services = await loadServices();
    const record = {
      id: "order-to-delete",
      orderNumber: "PO-DEL",
      deliveryDate: baseDates.deliveryDate,
      paymentDate: baseDates.paymentDate,
      description: "to delete",
      isUsePpn: false,
      ppn: 0,
      totalPrice: 20000,
      createdAt: baseDates.createdAt,
      supplier,
      purchaseLists: [purchaseListItem],
    };

    prisma.purchaseOrder.findUnique.mockResolvedValueOnce(record);
    prisma.purchaseOrder.delete.mockResolvedValueOnce(record);

    const result = await services.delete(record.id);

    expect(prisma.purchaseOrder.delete).toHaveBeenCalledWith({
      where: { id: record.id },
    });

    expect(result).toEqual(record);
  });
});
