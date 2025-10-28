import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  CreateWareHouse,
  UpdateWareHouse,
  WareHouseEntity,
  WareHouseList,
} from "./warehouses.schema";

export class WarehouseService {
  async create(data: CreateWareHouse): Promise<WareHouseEntity> {
    const warehouse = await prisma.warehouse.create({ data });

    return warehouse;
  }

  async find(pagination: PaginationQuery): Promise<WareHouseList> {
    const { limit, page, search } = pagination;

    const searchCondition = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : undefined;

    const count = await prisma.warehouse.count({ where: searchCondition });

    const wareHouses = await prisma.warehouse.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: searchCondition,
    });

    return {
      items: wareHouses,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string): Promise<WareHouseEntity> {
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });

    if (!warehouse) {
      throw new AppError("NOT_FOUND", 404, "WareHouse not found");
    }

    return warehouse;
  }

  async update(id: string, data: UpdateWareHouse): Promise<WareHouseEntity> {
    await this.findOne(id);
    const warehouse = await prisma.warehouse.update({ where: { id }, data });

    return warehouse;
  }

  async delete(id: string): Promise<WareHouseEntity> {
    const warehouse = await this.findOne(id);
    await prisma.warehouse.delete({ where: { id } });

    return warehouse;
  }
}
