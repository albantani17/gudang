import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  CreateSupplier,
  SupplierEntity,
  SupplierList,
  UpdateSupplier,
} from "./suppliers.schema";

export const suppliersServices = {
  async create(data: CreateSupplier): Promise<SupplierEntity> {
    const lastSupplier = await prisma.supplier.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    const code = lastSupplier ? Number(lastSupplier.code.split("-")[1]) + 1 : 1;
    const codeFormat = `SUP-${code}`;

    const supplier = await prisma.supplier.create({
      data: { ...data, code: codeFormat },
    });

    return supplier;
  },

  async find(pagination: PaginationQuery): Promise<SupplierList> {
    const { search, limit, page } = pagination;

    const where = search ? { name: { contains: search } } : undefined;

    const count = await prisma.supplier.count({ where });

    const suppliers = await prisma.supplier.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where,
    });

    return {
      items: suppliers,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async findOne(id: string): Promise<SupplierEntity> {
    const supplier = await prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      throw new AppError("NOT_FOUND", 404, "Supplier not found");
    }

    return supplier;
  },

  async update(id: string, data: UpdateSupplier): Promise<SupplierEntity> {
    await this.findOne(id);
    const supplier = await prisma.supplier.update({ where: { id }, data });

    return supplier;
  },

  async delete(id: string): Promise<SupplierEntity> {
    const supplier = await this.findOne(id);
    await prisma.supplier.delete({ where: { id } });

    return supplier;
  },
};
