import z from "zod";

export const PaginationQuery = z.object({
  limit: z.coerce.number().int().min(1,"Limit harus lebih dari 0").max(100).default(10),
  page: z.coerce.number().int().min(1,"Page minimal 1").default(1),
  search: z.string("Search harus berupa string").optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuery>;
