import z from "zod";
import { CategoryEntity } from "../categories/categories.schema";
import { UnitEntity } from "../units/units.schema";

export const CreateProduct = z.object({
  name: z.string(),
  categoryId: z.uuid(),
  unitId: z.uuid(),
});

export const UpdateProduct = z.object({
  name: z.string().optional(),
  categoryId: z.uuid().optional(),
  unitId: z.uuid().optional(),
});

export const ProductIdParam = z.object({ id: z.uuid() });

export const ProductEntity = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  category: CategoryEntity,
  unit: UnitEntity,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProductList = z.object({
  items: z.array(ProductEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateProduct = z.infer<typeof CreateProduct>;
export type UpdateProduct = z.infer<typeof UpdateProduct>;
export type ProductIdParam = z.infer<typeof ProductIdParam>;
export type ProductEntity = z.infer<typeof ProductEntity>;
export type ProductList = z.infer<typeof ProductList>;
