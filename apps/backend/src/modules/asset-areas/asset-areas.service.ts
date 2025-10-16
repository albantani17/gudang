import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import { AssetAreaEntity, AssetAreaList, CreateAssetArea, UpdateAssetArea } from "./asset-areas.schema";

export const assetAreasServices = {
  async create(data: CreateAssetArea): Promise<AssetAreaEntity> {
    const exists = await prisma.assetArea.findFirst({
      where: {
        code: data.code,
      },
    });

    if (exists) {
      throw new AppError("BAD_REQUEST", 400, "Asset area already exists");
    }

    const assetArea = await prisma.assetArea.create({ data });

    return assetArea;
  },

  async find(pagination: PaginationQuery): Promise<AssetAreaList> {
    const { search, limit, page } = pagination;

    const count = await prisma.assetArea.count({
      where: { name: { contains: search } },
    });

    const assetAreas = await prisma.assetArea.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { name: { contains: search } },
    });

    return {
      items: assetAreas,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async findOne(id: string): Promise<AssetAreaEntity> {
    const assetArea = await prisma.assetArea.findUnique({ where: { id } });

    if (!assetArea) {
      throw new AppError("NOT_FOUND", 404, "Asset area not found");
    }

    return assetArea;
  },

  async update(id: string, data: UpdateAssetArea): Promise<AssetAreaEntity> {
    await this.findOne(id);

    const assetArea = await prisma.assetArea.update({ where: { id }, data });

    return assetArea;
  },

  async delete(id: string): Promise<AssetAreaEntity> {
    const assetArea = await this.findOne(id);
    await prisma.assetArea.delete({ where: { id } });
    return assetArea;
  },
};
