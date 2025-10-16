import z from "zod";

export const CreateCategory = z.object({
  name: z.string(),
});

export const UpdateCategory = z.object({
  name: z.string().optional(),
});

export const CategoryIdParam = z.object({ id: z.uuid() });

export const CategoryEntity = z.object({
  id: z.uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CategoryList = z.object({
  items: z.array(CategoryEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateCategory = z.infer<typeof CreateCategory>;
export type UpdateCategory = z.infer<typeof UpdateCategory>;
export type CategoryIdParam = z.infer<typeof CategoryIdParam>;
export type CategoryEntity = z.infer<typeof CategoryEntity>;
export type CategoryList = z.infer<typeof CategoryList>;
