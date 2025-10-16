import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import { CreateProduct, ProductEntity, ProductList } from "./products.schema";

export const productsServices = {
  async create(data: CreateProduct): Promise<ProductEntity> {
    const lastCodeProduct = await prisma.product.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    const code = lastCodeProduct
      ? Number(lastCodeProduct.code.split("-")[1]) + 1
      : 1;
    const codeFormat = `PART-${code}`;

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError("NOT_FOUND", 404, "Category not found");
    }

    const unit = await prisma.unit.findUnique({ where: { id: data.unitId } });

    if (!unit) {
      throw new AppError("NOT_FOUND", 404, "Unit not found");
    }

    const product = await prisma.product.create({
      data: { ...data, code: codeFormat },
      omit: { categoryId: true, unitId: true },
      include: { category: true, unit: true },
    });

    return product;
  },

  async find(pagination: PaginationQuery): Promise<ProductList> {
    const { search, limit, page } = pagination;

    const count = await prisma.product.count({
      where: { name: { contains: search } },
    });

    const products = await prisma.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { name: { contains: search } },
      include: { category: true, unit: true },
    });

    return {
      items: products,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async findOne(id: string): Promise<ProductEntity> {
    const product = await prisma.product.findUnique({
      where: { id },
      omit: { categoryId: true, unitId: true },
      include: { category: true, unit: true },
    });

    if (!product) {
      throw new AppError("NOT_FOUND", 404, "Product not found");
    }

    return product;
  },

  async update(id: string, data: CreateProduct): Promise<ProductEntity> {
    await this.findOne(id);
    const product = await prisma.product.update({
      where: { id },
      data,
      omit: { categoryId: true, unitId: true },
      include: { category: true, unit: true },
    });

    return product;
  },

  async delete(id: string): Promise<ProductEntity> {
    const product = await this.findOne(id);
    await prisma.product.delete({ where: { id } });

    return product;
  },
};
