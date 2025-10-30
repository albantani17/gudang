import { AppError } from "../../common/errors";
import { PaginationQuery } from "../../common/schema/pagination.schema";
import prisma from "../../lib/prisma";
import {
  CreatePurchaseOrder,
  PurchaseOrderEntity,
  PurchaseOrderList,
} from "./purchase-order.schema";

export const purchaseOrderServices = {
  async create(data: CreatePurchaseOrder): Promise<PurchaseOrderEntity> {
    const existsPurchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        orderNumber: data.orderNumber,
      },
      include: {
        supplier: true,
        purchaseLists: true,
      },
    });

    if (existsPurchaseOrder) {
      throw new AppError("BAD_REQUEST", 400, "order number already exists");
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        deliveryDate: data.deliveryDate,
        orderNumber: data.orderNumber,
        paymentDate: data.paymentDate,
        isUsePpn: data.isUsePpn,
        ppn: data.isUsePpn ? data.ppn : 0,
        description: data.description,
        supplierId: data.supplierId,
        totalPrice: data.totalPrice,
        purchaseLists: {
          create: data.purchaseLists.map((purchaseList) => ({
            productId: purchaseList.productId,
            basePrice: purchaseList.basePrice,
            amount: purchaseList.amount,
            totalPrice: purchaseList.totalPrice,
          })),
        },
      },
      include: {
        supplier: true,
        purchaseLists: true,
      },
    });

    const result: PurchaseOrderEntity = {
      id: purchaseOrder.id,
      orderNumber: purchaseOrder.orderNumber,
      deliveryDate: purchaseOrder.deliveryDate,
      paymentDate: purchaseOrder.paymentDate,
      description: purchaseOrder.description || undefined,
      isUsePpn: purchaseOrder.isUsePpn,
      ppn: purchaseOrder.ppn,
      totalPrice: purchaseOrder.totalPrice,
      createdAt: purchaseOrder.createdAt,
      purchaseLists: purchaseOrder.purchaseLists.map((purchaseList) => ({
        id: purchaseList.id,
        productId: purchaseList.productId,
        basePrice: purchaseList.basePrice,
        amount: purchaseList.amount,
        totalPrice: purchaseList.totalPrice,
      })),
      supplier: purchaseOrder.supplier,
    };

    return result;
  },

  async find(pagination: PaginationQuery): Promise<PurchaseOrderList> {
    const { search, limit, page } = pagination;

    const where = search ? { orderNumber: { contains: search } } : undefined;

    const count = await prisma.purchaseOrder.count({ where });

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where,
      include: {
        supplier: true,
        purchaseLists: true,
      },
      omit: { supplierId: true },
    });

    return {
      items: purchaseOrders.map((purchaseOrder) => ({
        id: purchaseOrder.id,
        orderNumber: purchaseOrder.orderNumber,
        deliveryDate: purchaseOrder.deliveryDate,
        paymentDate: purchaseOrder.paymentDate,
        description: purchaseOrder.description || undefined,
        isUsePpn: purchaseOrder.isUsePpn,
        ppn: purchaseOrder.ppn,
        totalPrice: purchaseOrder.totalPrice,
        createdAt: purchaseOrder.createdAt,
        supplier: purchaseOrder.supplier,
        purchaseLists: purchaseOrder.purchaseLists.map((purchaseList) => ({
          id: purchaseList.id,
          productId: purchaseList.productId,
          basePrice: purchaseList.basePrice,
          amount: purchaseList.amount,
          totalPrice: purchaseList.totalPrice,
        })),
      })),
      total: count,
      pagination: {
        limit,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  async findOne(id: string): Promise<PurchaseOrderEntity> {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchaseLists: true,
      },
      omit: { supplierId: true },
    });

    if (!purchaseOrder) {
      throw new AppError("NOT_FOUND", 404, "Purchase order not found");
    }

    const result = {
      ...purchaseOrder,
      description: purchaseOrder.description || undefined,
    };

    return result;
  },

  async delete(id: string): Promise<PurchaseOrderEntity> {
    const purchaseOrder = await this.findOne(id);
    await prisma.purchaseOrder.delete({ where: { id } });
    return purchaseOrder;
  },
};
