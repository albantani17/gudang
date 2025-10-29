import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  CreateTransactionOut,
  TransactionOutEntity,
  TransactionOutList,
} from "./transactions-out.schema";

export class TransactionsOutService {
  MAX_RETRY = 5;
  async create(data: CreateTransactionOut): Promise<TransactionOutEntity> {
    for (let attempt = 1; attempt <= this.MAX_RETRY; attempt++) {
      try {
        return await prisma.$transaction(async (tx) => {
          const stock = await tx.productWarehouseStock.findFirst({
            where: {
              productId: data.productId,
              wareHouseId: data.warehouseId,
            },
            select: { qtyOnHand: true, version: true },
          });

          const currentQty = Number(stock?.qtyOnHand || 0);
          const currentVersion = stock?.version ?? 0;

          if (currentQty < data.amount) {
            throw new AppError(
              "BAD_REQUEST",
              400,
              `Stock tidak cukup: ada ${currentQty}, diminta ${data.amount}`
            );
          }

          const updated = await tx.productWarehouseStock.updateMany({
            where: {
              productId: data.productId,
              wareHouseId: data.warehouseId,
              version: currentVersion,
              qtyOnHand: { gte: data.amount },
            },
            data: {
              qtyOnHand: { decrement: data.amount },
              version: { increment: 1 },
            },
          });

          if (updated.count === 0) {
            throw new Error("CONFLICT_RETRY");
          }

          const lastCode = await tx.transactionOut.findFirst({
            orderBy: { invoice: "desc" },
            select: { invoice: true },
          });

          const invoice = lastCode?.invoice
            ? Number(lastCode.invoice.split("-")[1]) + 1
            : 1;

          const transactionId = `TR-${invoice}`;

          const row = await tx.transactionOut.create({
            data: {
              ...data,
              transactionId,
            },
            include: { product: true, warehouse: true },
          });

          return row;
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "CONFLICT_RETRY" && attempt < this.MAX_RETRY) {
            continue;
          }
          throw error;
        }
      }
    }

    throw new AppError("BAD_REQUEST", 500, "Gagal membuat transaksi");
  }

  async find(pagination: PaginationQuery): Promise<TransactionOutList> {
    const { search, limit, page } = pagination;

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

    const count = await prisma.transactionOut.count({
      where: { OR: searchCondition },
    });

    const transactionOuts = await prisma.transactionOut.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { OR: searchCondition },
      include: {
        product: true,
        warehouse: true,
      },
      omit: { productId: true, warehouseId: true },
    });

    return {
      items: transactionOuts,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string): Promise<TransactionOutEntity> {
    const transactionOut = await prisma.transactionOut.findUnique({
      where: { id },
      include: { product: true, warehouse: true },
    });

    if (!transactionOut) {
      throw new AppError("NOT_FOUND", 404, "Transaction out not found");
    }

    return transactionOut;
  }

  async remove(id: string): Promise<TransactionOutEntity> {
    const transactionOut = await this.findOne(id);
    return prisma.$transaction(async (tx) => {
      await tx.transactionOut.delete({ where: { id } });

      await tx.productWarehouseStock.update({
        where: {
          productId_wareHouseId: {
            productId: transactionOut.product.id,
            wareHouseId: transactionOut.warehouse.id,
          },
        },
        data: {
          qtyOnHand: {
            increment: transactionOut.amount,
          },
          version: {
            increment: 1,
          },
        },
      });

      return transactionOut;
    });
  }
}
