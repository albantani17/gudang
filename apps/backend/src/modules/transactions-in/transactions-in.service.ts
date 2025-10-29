import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  CreateTransactionIn,
  TransactionInEntity,
  TransactionInList,
} from "./transactions-in.schema";

export class TransactionInService {
  async create(data: CreateTransactionIn): Promise<TransactionInEntity> {
    return prisma.$transaction(async (tx) => {
      const findExistsingCode = await prisma.transactionIn.findFirst({
        where: {
          invoice: data.invoice,
        },
      });

      if (findExistsingCode) {
        throw new AppError("BAD_REQUEST", 400, "Invoice already exists");
      }

      const count = await prisma.transactionIn.count();

      const transactionId = `TR-${count + 1}`;

      const payload = { ...data, transactionId };

      const transactionIn = await prisma.transactionIn.create({
        data: payload,
        omit: { productId: true, supplierId: true, warehouseId: true },
        include: { product: true, supplier: true, warehouse: true },
      });

      await tx.productWarehouseStock.upsert({
        where: {
          productId_wareHouseId: {
            productId: data.productId,
            wareHouseId: data.warehouseId,
          },
        },
        create: {
          productId: data.productId,
          wareHouseId: data.warehouseId,
          qtyOnHand: data.amount,
        },
        update: {
          qtyOnHand: {
            increment: data.amount,
          },
          version: {
            increment: 1,
          },
        },
      });

      return transactionIn;
    });
  }

  async find(pagination: PaginationQuery): Promise<TransactionInList> {
    const { limit, page, search } = pagination;

    const searchCondition = search
      ? [
          { invoice: { contains: search, mode: "insensitive" as const } },
          { transactionId: { contains: search, mode: "insensitive" as const } },
          {
            product: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
        ]
      : undefined;

    const count = await prisma.transactionIn.count({
      where: { OR: searchCondition },
    });

    const transactionIns = await prisma.transactionIn.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { OR: searchCondition },
      include: {
        product: true,
        supplier: true,
        warehouse: true,
      },
      omit: { productId: true, supplierId: true, warehouseId: true },
    });

    return {
      items: transactionIns,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string): Promise<TransactionInEntity> {
    const transactionIn = await prisma.transactionIn.findUnique({
      where: { id },
      include: {
        product: true,
        supplier: true,
        warehouse: true,
      },
    });

    if (!transactionIn) {
      throw new AppError("NOT_FOUND", 404, "Transaction not found");
    }

    return transactionIn;
  }

  async remove(id: string): Promise<TransactionInEntity> {
    const transactionIn = await this.findOne(id);
    await prisma.transactionIn.delete({ where: { id } });

    return transactionIn;
  }
}
