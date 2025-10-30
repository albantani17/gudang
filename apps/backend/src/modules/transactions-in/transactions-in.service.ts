import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  CreateTransactionIn,
  TransactionInEntity,
  TransactionInList,
} from "./transactions-in.schema";

type PrismaUniqueConstraintError = {
  code: string;
  meta?: {
    target?: string[];
  };
};

const isUniqueConstraintError = (
  error: unknown
): error is PrismaUniqueConstraintError =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as PrismaUniqueConstraintError).code === "P2002";

export class TransactionInService {
  private readonly MAX_RETRY = 5;

  private nextTransactionId(previous?: string | null) {
    const current = previous?.split("-")[1];
    const lastSequence = current ? Number(current) : 0;
    const next = Number.isNaN(lastSequence) ? 1 : lastSequence + 1;
    return `TR-${next}`;
  }

  async create(data: CreateTransactionIn): Promise<TransactionInEntity> {
    for (let attempt = 1; attempt <= this.MAX_RETRY; attempt++) {
      try {
        return await prisma.$transaction(async (tx) => {
          const existingInvoice = await tx.transactionIn.findFirst({
            where: { invoice: data.invoice },
            select: { id: true },
          });

          if (existingInvoice) {
            throw new AppError("BAD_REQUEST", 400, "Invoice already exists");
          }

          const lastTransaction = await tx.transactionIn.findFirst({
            orderBy: { createdAt: "desc" },
            select: { transactionId: true },
          });

          const transactionId = this.nextTransactionId(
            lastTransaction?.transactionId
          );

          const transactionIn = await tx.transactionIn.create({
            data: { ...data, transactionId },
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
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          const targets = Array.isArray(error.meta?.target)
            ? (error.meta?.target as string[])
            : [];

          if (targets.includes("invoice")) {
            throw new AppError("BAD_REQUEST", 400, "Invoice already exists");
          }

          if (targets.includes("transactionId") && attempt < this.MAX_RETRY) {
            continue;
          }
        }
        throw error;
      }
    }

    throw new AppError("INTERNAL", 500, "Failed to create transaction");
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
    return prisma.$transaction(async (tx) => {
      const transactionIn = await tx.transactionIn.findUnique({
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

      await tx.transactionIn.delete({ where: { id } });

      await tx.productWarehouseStock.update({
        where: {
          productId_wareHouseId: {
            productId: transactionIn.product.id,
            wareHouseId: transactionIn.warehouse.id,
          },
        },
        data: {
          qtyOnHand: {
            decrement: transactionIn.amount,
          },
          version: {
            increment: 1,
          },
        },
      });

      return transactionIn;
    });
  }
}
