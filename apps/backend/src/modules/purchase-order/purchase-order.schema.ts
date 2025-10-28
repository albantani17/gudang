import z from "zod";

export const CreatePurchaseOrder = z.object({
  orderNumber: z.string(),
  deliveryDate: z.date(),
  paymentDate: z.date(),
  description: z.string().optional(),
  supplierId: z.uuid(),
  isUsePpn: z.boolean(),
  ppn: z.number(),
  totalPrice: z.number(),
  purchaseLists: z.array(
    z.object({
      productId: z.uuid(),
      basePrice: z.number(),
      amount: z.number(),
      totalPrice: z.number(),
    })
  ),
});

export const PurchaseOrderEntity = z.object({
  id: z.uuid(),
  orderNumber: z.string(),
  deliveryDate: z.date(),
  paymentDate: z.date(),
  description: z.string().optional(),
  isUsePpn: z.boolean(),
  ppn: z.number(),
  totalPrice: z.number(),
  createdAt: z.date(),
  purchaseLists: z.array(
    z.object({
      id: z.uuid(),
      productId: z.uuid(),
      basePrice: z.number(),
      amount: z.number(),
      totalPrice: z.number(),
    })
  ),
  supplier: z.object({
    id: z.uuid(),
    name: z.string(),
    address: z.string(),
    contact: z.string(),
  }),
});

export const PurchaseOrderList = z.object({
  items: z.array(PurchaseOrderEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export const PurchaseOrderIdParam = z.object({ id: z.uuid() });

export type CreatePurchaseOrder = z.infer<typeof CreatePurchaseOrder>;
export type PurchaseOrderEntity = z.infer<typeof PurchaseOrderEntity>;
export type PurchaseOrderList = z.infer<typeof PurchaseOrderList>;
export type PurchaseOrderIdParam = z.infer<typeof PurchaseOrderIdParam>;
