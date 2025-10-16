import z from "zod";

export const CreateUnitSchema = z.object({
  code: z
    .string()
    .refine((val) => !/\s/.test(val), "String must not contain spaces"),
  description: z.string(),
});

export const UpdateUnitSchema = z.object({
  code: z
    .string()
    .refine((val) => !/\s/.test(val), "String must not contain spaces")
    .optional(),
  description: z.string().optional(),
});

export const UnitIdParam = z.object({ id: z.uuid() });

export const UnitEntity = z.object({
  id: z.uuid(),
  code: z.string(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UnitList = z.object({
  items: z.array(UnitEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateUnit = z.infer<typeof CreateUnitSchema>;
export type UpdateUnit = z.infer<typeof UpdateUnitSchema>;
export type UnitEntity = z.infer<typeof UnitEntity>;
export type UnitList = z.infer<typeof UnitList>;