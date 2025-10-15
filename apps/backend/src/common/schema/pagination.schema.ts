import z from "zod";

export const PaginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuery>;
