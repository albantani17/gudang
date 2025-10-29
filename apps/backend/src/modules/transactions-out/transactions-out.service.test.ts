import { afterAll, beforeEach, describe, expect, it, jest } from "bun:test";
import { AppError } from "../../common/errors";
import prisma from "../../lib/prisma";
import { TransactionsOutService } from "./transactions-out.service";

const sampleDates = {
  exit: new Date("2024-04-01T00:00:00.000Z"),
  createdAt: new Date("2024-04-02T00:00:00.000Z"),
};

const sampleProduct = {
  id: "11111111-2222-3333-4444-555555555555",
  name: "Pompa Air",
  code: "PROD-99",
  createdAt: sampleDates.exit,
  updatedAt: sampleDates.exit,
};

const sampleWarehouse = {
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  name: "Warehouse Selatan",
  createdAt: sampleDates.exit,
  updatedAt: sampleDates.exit,
};

const sampleCreatePayload = {
  productId: sampleProduct.id,
  warehouseId: sampleWarehouse.id,
  invoice: "OUT-INV-001",
  amount: 5,
  purpose: "Maintenance",
  exitDate: sampleDates.exit,
};

const sampleTransactionOutRecord = {
  id: "99999999-8888-7777-6666-555555555555",
  transactionId: "TR-8",
  invoice: sampleCreatePayload.invoice,
  amount: sampleCreatePayload.amount,
  purpose: sampleCreatePayload.purpose,
  exitDate: sampleDates.exit,
  createdAt: sampleDates.createdAt,
  product: sampleProduct,
  warehouse: sampleWarehouse,
};

const originalTransactionOut = prisma.transactionOut;
const original$transaction = prisma.$transaction;

const createTransactionOutMock = () => ({
  findFirst: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  delete: jest.fn(),
});

const createTransactionClientMock = () => ({
  productWarehouseStock: {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
  },
  transactionOut: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
});

let transactionOutMock = createTransactionOutMock();
let transactionClientMock = createTransactionClientMock();
let transactionRunnerMock = jest.fn(async (cb: any) => cb(transactionClientMock));

beforeEach(() => {
  jest.restoreAllMocks();
  transactionOutMock = createTransactionOutMock();
  transactionClientMock = createTransactionClientMock();
  transactionRunnerMock = jest.fn(async (cb: any) => cb(transactionClientMock));
  (prisma as any).transactionOut = transactionOutMock;
  (prisma as any).$transaction = transactionRunnerMock;
});

afterAll(() => {
  (prisma as any).transactionOut = originalTransactionOut;
  (prisma as any).$transaction = original$transaction;
});

describe("TransactionsOutService", () => {
  let service: TransactionsOutService;

  beforeEach(() => {
    service = new TransactionsOutService();
  });

  describe("create", () => {
    it("throws when stock is insufficient", async () => {
      transactionClientMock.productWarehouseStock.findFirst.mockResolvedValueOnce({
        qtyOnHand: 2,
        version: 1,
      });

      await expect(service.create(sampleCreatePayload)).rejects.toMatchObject({
        code: "BAD_REQUEST",
        status: 400,
        message: "Stock tidak cukup: ada 2, diminta 5",
      });

      expect(transactionRunnerMock).toHaveBeenCalledTimes(1);
      expect(transactionClientMock.productWarehouseStock.updateMany).not.toHaveBeenCalled();
    });

    it("retries on concurrent stock updates before creating a transaction", async () => {
      transactionClientMock.productWarehouseStock.findFirst.mockResolvedValue({
        qtyOnHand: 10,
        version: 4,
      });
      transactionClientMock.productWarehouseStock.updateMany
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 1 });
      transactionClientMock.transactionOut.findFirst.mockResolvedValueOnce({ invoice: "TR-7" });
      transactionClientMock.transactionOut.create.mockResolvedValueOnce(
        sampleTransactionOutRecord as any
      );

      const result = await service.create(sampleCreatePayload);

      expect(transactionRunnerMock).toHaveBeenCalledTimes(2);
      expect(transactionClientMock.productWarehouseStock.findFirst).toHaveBeenCalledTimes(2);
      expect(transactionClientMock.productWarehouseStock.updateMany).toHaveBeenCalledTimes(2);
      expect(transactionClientMock.productWarehouseStock.updateMany).toHaveBeenNthCalledWith(2, {
        where: {
          productId: sampleCreatePayload.productId,
          wareHouseId: sampleCreatePayload.warehouseId,
          version: 4,
          qtyOnHand: { gte: sampleCreatePayload.amount },
        },
        data: {
          qtyOnHand: { decrement: sampleCreatePayload.amount },
          version: { increment: 1 },
        },
      });
      expect(transactionClientMock.transactionOut.findFirst).toHaveBeenCalledTimes(1);
      expect(transactionClientMock.transactionOut.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ...sampleCreatePayload,
            transactionId: "TR-8",
          }),
          include: expect.objectContaining({
            product: true,
            warehouse: true,
          }),
        })
      );
      expect(result).toEqual(sampleTransactionOutRecord);
    });

    it("throws when all retries are exhausted", async () => {
      service.MAX_RETRY = 3;
      transactionClientMock.productWarehouseStock.findFirst.mockResolvedValue({
        qtyOnHand: 10,
        version: 2,
      });
      transactionClientMock.productWarehouseStock.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.create(sampleCreatePayload)).rejects.toHaveProperty(
        "message",
        "CONFLICT_RETRY"
      );

      expect(transactionRunnerMock).toHaveBeenCalledTimes(3);
      expect(transactionClientMock.transactionOut.findFirst).not.toHaveBeenCalled();
      expect(transactionClientMock.transactionOut.create).not.toHaveBeenCalled();
    });
  });

  describe("find", () => {
    it("returns paginated results with search filter", async () => {
      const pagination = { limit: 3, page: 3, search: "TR-8" };
      const expectedSearch = [
        { invoice: { contains: pagination.search, mode: "insensitive" as const } },
        { transactionId: { contains: pagination.search, mode: "insensitive" as const } },
        {
          product: {
            name: { contains: pagination.search, mode: "insensitive" as const },
          },
        },
      ];

      transactionOutMock.count.mockResolvedValueOnce(6);
      transactionOutMock.findMany.mockResolvedValueOnce([sampleTransactionOutRecord] as any);

      const result = await service.find(pagination);

      expect(transactionOutMock.count).toHaveBeenCalledWith({
        where: { OR: expectedSearch },
      });
      expect(transactionOutMock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: pagination.limit,
          skip: (pagination.page - 1) * pagination.limit,
          where: { OR: expectedSearch },
        })
      );
      expect(result).toEqual({
        items: [sampleTransactionOutRecord],
        total: 6,
        pagination: {
          limit: pagination.limit,
          currentPage: pagination.page,
          totalPages: Math.ceil(6 / pagination.limit),
        },
      });
    });

    it("returns empty pagination when no data", async () => {
      const pagination = { limit: 2, page: 1 };

      transactionOutMock.count.mockResolvedValueOnce(0);
      transactionOutMock.findMany.mockResolvedValueOnce([] as any);

      const result = await service.find(pagination);

      expect(transactionOutMock.count).toHaveBeenCalledWith({
        where: { OR: undefined },
      });
      expect(transactionOutMock.findMany).toHaveBeenCalledWith(
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
    it("throws when transaction out is not found", async () => {
      transactionOutMock.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne("not-found")).rejects.toBeInstanceOf(AppError);
    });

    it("returns the transaction out when found", async () => {
      transactionOutMock.findUnique.mockResolvedValueOnce(sampleTransactionOutRecord as any);

      const result = await service.findOne(sampleTransactionOutRecord.id);

      expect(transactionOutMock.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: sampleTransactionOutRecord.id },
        })
      );
      expect(result).toEqual(sampleTransactionOutRecord);
    });
  });

  describe("remove", () => {
    it("deletes the transaction and returns the previous entity", async () => {
      transactionOutMock.findUnique.mockResolvedValueOnce(sampleTransactionOutRecord as any);
      transactionClientMock.transactionOut.delete.mockResolvedValueOnce(undefined);
      transactionClientMock.productWarehouseStock.update.mockResolvedValueOnce(undefined);

      const result = await service.remove(sampleTransactionOutRecord.id);

      expect(transactionOutMock.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: sampleTransactionOutRecord.id },
        })
      );
      expect(transactionClientMock.transactionOut.delete).toHaveBeenCalledWith({
        where: { id: sampleTransactionOutRecord.id },
      });
      expect(transactionClientMock.productWarehouseStock.update).toHaveBeenCalledWith({
        where: {
          productId_wareHouseId: {
            productId: sampleTransactionOutRecord.product.id,
            wareHouseId: sampleTransactionOutRecord.warehouse.id,
          },
        },
        data: {
          qtyOnHand: {
            increment: sampleTransactionOutRecord.amount,
          },
          version: {
            increment: 1,
          },
        },
      });
      expect(result).toEqual(sampleTransactionOutRecord);
      expect(transactionRunnerMock).toHaveBeenCalledTimes(1);
    });
  });
});
