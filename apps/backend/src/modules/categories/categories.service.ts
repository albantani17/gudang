import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  CategoryEntity,
  CategoryList,
  CreateCategory,
  UpdateCategory,
} from "./categories.schema";

export const categoriesServices = {
  async create(data: CreateCategory): Promise<CategoryEntity> {
    const category = await prisma.category.create({ data });

    return category;
  },

  async find(pagination: PaginationQuery): Promise<CategoryList> {
    const { search, limit, page } = pagination;

    const where = search ? { name: { contains: search } } : undefined;

    const count = await prisma.category.count({ where });

    const categories = await prisma.category.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where,
    });

    return {
      items: categories,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async findOne(id: string): Promise<CategoryEntity> {
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new AppError("NOT_FOUND", 404, "Category not found");
    }

    return category;
  },

  async update(id: string, data: UpdateCategory): Promise<CategoryEntity> {
    await this.findOne(id);
    const category = await prisma.category.update({ where: { id }, data });

    return category;
  },

  async delete(id: string): Promise<CategoryEntity> {
    const category = await this.findOne(id);
    await prisma.category.delete({ where: { id } });
    return category;
  },
};
