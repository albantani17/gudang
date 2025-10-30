import { afterAll, beforeEach, describe, expect, it, jest } from "bun:test";
import { AppError } from "../../common/errors";
import prisma from "../../lib/prisma";
import { TransactionInService } from "./transactions-in.service";

const sampleDates = {
  now: new Date("2024-03-01T00:00:00.000Z"),
  createdAt: new Date("2024-03-02T00:00:00.000Z"),
};

const sampleProduct = {
  id: "0a1c4a76-2eb2-4bd9-9ce2-3f5b6a7b8c91",
  name: "Panel Surya",
  code: "PROD-1",
  createdAt: sampleDates.now,
  updatedAt: sampleDates.now,
};

const sampleSupplier = {
  id: "3e4b5e6d-7f8a-4b9c-8d7e-6c5b4a3f2e1d",
  name: "Supplier Sentosa",
  code: "SUP-1",
  address: "Jl. Merdeka No. 1",
  contact: "081234567890",
  createdAt: sampleDates.now,
  updatedAt: sampleDates.now,
};

const sampleWarehouse = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  name: "Gudang Utama",
  createdAt: sampleDates.now,
  updatedAt: sampleDates.now,
};

const sampleCreatePayload = {
  productId: sampleProduct.id,
  supplierId: sampleSupplier.id,
  warehouseId: sampleWarehouse.id,
  invoice: "INV-001",
  amount: 10,
  date: sampleDates.now,
};

const sampleTransactionInRecord = {
  id: "f1e2d3c4-b5a6-7890-1234-56789abcdef0",
  transactionId: "TR-5",
  invoice: sampleCreatePayload.invoice,
  amount: sampleCreatePayload.amount,
  date: sampleDates.now,
  createdAt: sampleDates.createdAt,
  product: sampleProduct,
  supplier: sampleSupplier,
  warehouse: sampleWarehouse,
};

const originalTransactionIn = prisma.transactionIn;
const original$transaction = prisma.$transaction;

const createTransactionInMock = () => ({
  findFirst: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  delete: jest.fn(),
});

const createTransactionClientMock = () => ({
  transactionIn: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  productWarehouseStock: {
    upsert: jest.fn(),
    update: jest.fn(),
  },
});

let transactionInMock = createTransactionInMock();
let transactionClientMock = createTransactionClientMock();
let transactionRunnerMock = jest.fn(async (cb: any) =>
  cb(transactionClientMock)
);

beforeEach(() => {
  jest.restoreAllMocks();
  transactionInMock = createTransactionInMock();
  transactionClientMock = createTransactionClientMock();
  transactionRunnerMock = jest.fn(async (cb: any) => cb(transactionClientMock));
  (prisma as any).transactionIn = transactionInMock;
  (prisma as any).$transaction = transactionRunnerMock;
});

afterAll(() => {
  (prisma as any).transactionIn = originalTransactionIn;
  (prisma as any).$transaction = original$transaction;
});

describe("TransactionInService", () => {
  const service = new TransactionInService();

  describe("create", () => {
    it("throws when invoice already exists", async () => {
      transactionClientMock.transactionIn.findFirst.mockResolvedValueOnce(
        sampleTransactionInRecord as any
      );

      await expect(service.create(sampleCreatePayload)).rejects.toMatchObject({
        code: "BAD_REQUEST",
        status: 400,
        message: "Invoice already exists",
      });

      expect(transactionClientMock.transactionIn.create).not.toHaveBeenCalled();
      expect(
        transactionClientMock.productWarehouseStock.upsert
      ).not.toHaveBeenCalled();
      expect(transactionRunnerMock).toHaveBeenCalledTimes(1);
    });

    it("creates a transaction in with generated transactionId", async () => {
      transactionClientMock.transactionIn.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ transactionId: "TR-4" });
      transactionClientMock.transactionIn.create.mockResolvedValueOnce(
        sampleTransactionInRecord as any
      );
      transactionClientMock.productWarehouseStock.upsert.mockResolvedValueOnce(
        undefined
      );

      const result = await service.create(sampleCreatePayload);

      expect(
        transactionClientMock.transactionIn.findFirst
      ).toHaveBeenCalledTimes(2);
      expect(
        transactionClientMock.productWarehouseStock.upsert
      ).toHaveBeenCalledWith({
        where: {
          productId_wareHouseId: {
            productId: sampleCreatePayload.productId,
            wareHouseId: sampleCreatePayload.warehouseId,
          },
        },
        create: {
          productId: sampleCreatePayload.productId,
          wareHouseId: sampleCreatePayload.warehouseId,
          qtyOnHand: sampleCreatePayload.amount,
        },
        update: {
          qtyOnHand: {
            increment: sampleCreatePayload.amount,
          },
          version: {
            increment: 1,
          },
        },
      });
      expect(transactionClientMock.transactionIn.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            transactionId: "TR-5",
            invoice: sampleCreatePayload.invoice,
            amount: sampleCreatePayload.amount,
          }),
          include: expect.objectContaining({
            product: true,
            supplier: true,
            warehouse: true,
          }),
          omit: expect.objectContaining({
            productId: true,
            supplierId: true,
            warehouseId: true,
          }),
        })
      );
      expect(result).toEqual(sampleTransactionInRecord);
      expect(transactionRunnerMock).toHaveBeenCalledTimes(1);
    });

    it("retries when transactionId hits a unique constraint race", async () => {
      const uniqueError = Object.assign(
        new Error("Unique constraint failed"),
        {
          code: "P2002",
          meta: {
            target: ["transactionId"],
          },
        }
      );

      transactionClientMock.transactionIn.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ transactionId: "TR-1" })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ transactionId: "TR-1" });

      transactionClientMock.transactionIn.create
        .mockRejectedValueOnce(uniqueError)
        .mockResolvedValueOnce({
          ...sampleTransactionInRecord,
          transactionId: "TR-2",
        });

      transactionClientMock.productWarehouseStock.upsert.mockResolvedValueOnce(
        undefined
      );

      const result = await service.create(sampleCreatePayload);

      expect(transactionClientMock.transactionIn.create).toHaveBeenCalledTimes(
        2
      );
      expect(
        transactionClientMock.productWarehouseStock.upsert
      ).toHaveBeenCalledTimes(1);
      expect(transactionRunnerMock).toHaveBeenCalledTimes(2);
      expect(result.transactionId).toBe("TR-2");
    });
  });

  describe("find", () => {
    it("returns paginated results with search criteria", async () => {
      const pagination = { limit: 10, page: 2, search: "INV" };
      const expectedSearch = [
        {
          invoice: {
            contains: pagination.search,
            mode: "insensitive" as const,
          },
        },
        {
          transactionId: {
            contains: pagination.search,
            mode: "insensitive" as const,
          },
        },
        {
          product: {
            name: { contains: pagination.search, mode: "insensitive" as const },
          },
        },
      ];

      transactionInMock.count.mockResolvedValueOnce(3);
      transactionInMock.findMany.mockResolvedValueOnce([
        sampleTransactionInRecord,
      ] as any);

      const result = await service.find(pagination);

      expect(transactionInMock.count).toHaveBeenCalledWith({
        where: { OR: expectedSearch },
      });
      expect(transactionInMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: pagination.limit,
          skip: (pagination.page - 1) * pagination.limit,
          where: { OR: expectedSearch },
        })
      );
      expect(result).toEqual({
        items: [sampleTransactionInRecord],
        total: 3,
        pagination: {
          limit: pagination.limit,
          currentPage: pagination.page,
          totalPages: Math.ceil(3 / pagination.limit),
        },
      });
    });

    it("handles empty search by omitting filters", async () => {
      const pagination = { limit: 5, page: 1 };

      transactionInMock.count.mockResolvedValueOnce(0);
      transactionInMock.findMany.mockResolvedValueOnce([] as any);

      const result = await service.find(pagination);

      expect(transactionInMock.count).toHaveBeenCalledWith({
        where: { OR: undefined },
      });
      expect(transactionInMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: undefined },
        })
      );
      expect(result).toEqual({
        items: [],
        total: 0,
        pagination: {
          limit: pagination.limit,
          currentPage: pagination.page,
          totalPages: 0,
        },
      });
    });
  });

  describe("findOne", () => {
    it("throws when transaction not found", async () => {
      transactionInMock.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(
        AppError
      );
    });

    it("returns the transaction when found", async () => {
      transactionInMock.findUnique.mockResolvedValueOnce(
        sampleTransactionInRecord as any
      );

      const result = await service.findOne(sampleTransactionInRecord.id);

      expect(transactionInMock.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: sampleTransactionInRecord.id },
        })
      );
      expect(result).toEqual(sampleTransactionInRecord);
    });
  });

  describe("remove", () => {
    it("deletes the transaction and returns the previous entity", async () => {
      transactionClientMock.transactionIn.findUnique.mockResolvedValueOnce(
        sampleTransactionInRecord as any
      );
      transactionClientMock.transactionIn.delete.mockResolvedValueOnce(
        undefined
      );
      transactionClientMock.productWarehouseStock.update.mockResolvedValueOnce(
        undefined
      );

      const result = await service.remove(sampleTransactionInRecord.id);

      expect(
        transactionClientMock.transactionIn.findUnique
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: sampleTransactionInRecord.id },
        })
      );
      expect(transactionClientMock.transactionIn.delete).toHaveBeenCalledWith({
        where: { id: sampleTransactionInRecord.id },
      });
      expect(
        transactionClientMock.productWarehouseStock.update
      ).toHaveBeenCalledWith({
        where: {
          productId_wareHouseId: {
            productId: sampleTransactionInRecord.product.id,
            wareHouseId: sampleTransactionInRecord.warehouse.id,
          },
        },
        data: {
          qtyOnHand: {
            decrement: sampleTransactionInRecord.amount,
          },
          version: {
            increment: 1,
          },
        },
      });
      expect(result).toEqual(sampleTransactionInRecord);
      expect(transactionRunnerMock).toHaveBeenCalledTimes(1);
    });
  });
});
