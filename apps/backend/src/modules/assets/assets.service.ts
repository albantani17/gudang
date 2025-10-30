import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  AssetEntity,
  AssetList,
  CreateAssetBody,
  ReturnAssetBody,
} from "./assets.schema";

export class AssetService {
  async create(data: CreateAssetBody): Promise<AssetEntity> {
    const asset = await prisma.asset.create({
      data,
      include: { assetArea: true, assetBroken: true, product: true },
    });

    return asset;
  }

  async find(pagination: PaginationQuery): Promise<AssetList> {
    const { search, limit, page } = pagination;

    const searchCondition = search
      ? [
          {
            product: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
          {
            assetArea: {
              name: { contains: search, mode: "insensitive" },
            } as const,
          },
        ]
      : undefined;

    const count = await prisma.asset.count({ where: { OR: searchCondition } });

    const assets = await prisma.asset.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { OR: searchCondition },
      include: { assetArea: true, assetBroken: true, product: true },
    });

    return {
      items: assets,
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string): Promise<AssetEntity> {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: { assetArea: true, assetBroken: true, product: true },
    });

    if (!asset) {
      throw new AppError("NOT_FOUND", 404, "Asset not found");
    }

    return asset;
  }

  async returnAsset(id: string, data: ReturnAssetBody): Promise<AssetEntity> {
    await this.findOne(id);

    return await prisma.$transaction(async(tx) => {
      const assetUpdate = await tx.asset.update({
        where: { id },
        data: {
          isActive: false,
        },
        include: { assetArea: true, assetBroken: true, product: true },
      });

      await tx.assetBroken.create({
        data: {
          assetId: id,
          condition: data.condition,
          information: data.information,
        },
      });

      return assetUpdate;
    });
  }

  async remove(id: string): Promise<AssetEntity> {
    const asset = await this.findOne(id);
    await prisma.asset.delete({
      where: { id },
      include: { product: true, assetArea: true },
    });
    return asset;
  }
}
