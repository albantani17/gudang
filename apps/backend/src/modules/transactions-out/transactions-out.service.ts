import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  CreateTransactionOut,
  TransactionOutEntity,
  TransactionOutList,
} from "./transactions-out.schema";

export class TransactionsOutService {
  async create(data: CreateTransactionOut): Promise<TransactionOutEntity> {
    const findExistingInvoice = await prisma.transactionOut.findFirst({
      where: {
        invoice: data.invoice,
      },
    });

    if (findExistingInvoice) {
      throw new AppError("BAD_REQUEST", 400, "Invoice already exists");
    }

    const count = await prisma.transactionOut.count();

    const transactionId = `TR-${count + 1}`;

    const transactionOut = await prisma.transactionOut.create({
      data: { ...data, transactionId },
      include: { product: true, warehouse: true },
    });

    return transactionOut;
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
    await prisma.transactionOut.delete({ where: { id } });

    return transactionOut;
  }
}
