import z from "zod";

export const CreateRole = z.object({
  name: z.string(),
  permission: z.array(z.string()),
});

export const UpdateRole = z.object({
  name: z.string().optional(),
  permission: z.array(z.string()).optional(),
});

export const RoleIdParam = z.object({ id: z.uuid() });

export const RoleEntity = z.object({
  id: z.uuid(),
  name: z.string(),
  permission: z.array(z.string()),
});

export const RoleList = z.object({
  items: z.array(RoleEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateRole = z.infer<typeof CreateRole>;
export type UpdateRole = z.infer<typeof UpdateRole>;
export type RoleEntity = z.infer<typeof RoleEntity>;
export type RoleList = z.infer<typeof RoleList>;
