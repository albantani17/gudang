import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import { CreateUnit, UnitEntity, UnitList, UpdateUnit } from "./units.schema";

export const unitServices = {
  async create(data: CreateUnit): Promise<UnitEntity> {
    const unitIsExists = await prisma.unit.findFirst({
      where: {
        code: data.code,
      },
    });

    if (unitIsExists) {
      throw new Error("Unit already exists");
    }

    const unit = await prisma.unit.create({
      data,
    });

    return unit;
  },

  async find(pagination: PaginationQuery): Promise<UnitList> {
    const { search, limit, page } = pagination;

    const where = search ? { code: { contains: search } } : undefined;

    const count = await prisma.unit.count({ where });

    const units = await prisma.unit.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where,
    });

    return {
      items: units,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async findOne(id: string): Promise<UnitEntity> {
    const unit = await prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new AppError("NOT_FOUND", 404, "Unit not found");
    }

    return unit;
  },

  async update(id: string, data: UpdateUnit): Promise<UnitEntity> {
    await this.findOne(id);

    const unit = await prisma.unit.update({
      where: { id },
      data,
    });

    return unit;
  },

  async delete(id: string): Promise<UnitEntity> {
    const unit = await this.findOne(id);
    await prisma.unit.delete({ where: { id } });
    return unit;
  },
};
