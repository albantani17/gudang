import z from "zod";

export const CreateSupplier = z.object({
  name: z.string(),
  address: z.string(),
  contact: z.string(),
});

export const UpdateSupplier = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
});

export const SupplierIdParam = z.object({ id: z.uuid() });

export const SupplierEntity = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  address: z.string(),
  contact: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SupplierList = z.object({
  items: z.array(SupplierEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateSupplier = z.infer<typeof CreateSupplier>;
export type UpdateSupplier = z.infer<typeof UpdateSupplier>;
export type SupplierIdParam = z.infer<typeof SupplierIdParam>;
export type SupplierEntity = z.infer<typeof SupplierEntity>;
export type SupplierList = z.infer<typeof SupplierList>;
