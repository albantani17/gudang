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

const createTransactionOutMock = () => ({
  findFirst: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  delete: jest.fn(),
});

let transactionOutMock = createTransactionOutMock();

beforeEach(() => {
  jest.restoreAllMocks();
  transactionOutMock = createTransactionOutMock();
  (prisma as any).transactionOut = transactionOutMock;
});

afterAll(() => {
  (prisma as any).transactionOut = originalTransactionOut;
});

describe("TransactionsOutService", () => {
  const service = new TransactionsOutService();

  describe("create", () => {
    it("throws when invoice already exists", async () => {
      transactionOutMock.findFirst.mockResolvedValueOnce(sampleTransactionOutRecord as any);

      await expect(service.create(sampleCreatePayload)).rejects.toMatchObject({
        code: "BAD_REQUEST",
        status: 400,
        message: "Invoice already exists",
      });

      expect(transactionOutMock.create).not.toHaveBeenCalled();
    });

    it("creates a transaction out with generated transactionId", async () => {
      transactionOutMock.findFirst.mockResolvedValueOnce(null);
      transactionOutMock.count.mockResolvedValueOnce(7);
      transactionOutMock.create.mockResolvedValueOnce(sampleTransactionOutRecord as any);

      const result = await service.create(sampleCreatePayload);

      expect(transactionOutMock.count).toHaveBeenCalledTimes(1);
      expect(transactionOutMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            transactionId: "TR-8",
            invoice: sampleCreatePayload.invoice,
            purpose: sampleCreatePayload.purpose,
            amount: sampleCreatePayload.amount,
          }),
          include: expect.objectContaining({
            product: true,
            warehouse: true,
          }),
        })
      );
      expect(result).toEqual(sampleTransactionOutRecord);
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
      transactionOutMock.delete.mockResolvedValueOnce(sampleTransactionOutRecord as any);

      const result = await service.remove(sampleTransactionOutRecord.id);

      expect(transactionOutMock.delete).toHaveBeenCalledWith({
        where: { id: sampleTransactionOutRecord.id },
      });
      expect(result).toEqual(sampleTransactionOutRecord);
    });
  });
});
