import { z } from "zod";

export const UserIdParam = z.object({
  id: z.uuid(),
});

export const CreateUserBody = z.object({
  email: z.email(),
  name: z.string(),
  username: z.string(),
  password: z.string().min(8).check(),
});

export const UpdateUserBody = z.object({
  email: z.email().optional(),
  name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const UserEntity = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  username: z.string(),
});

export const UserList = z.object({
  items: z.array(UserEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateUserBody = z.infer<typeof CreateUserBody>;
export type UpdateUserBody = z.infer<typeof UpdateUserBody>;
export type UserEntity = z.infer<typeof UserEntity>;
export type UserList = z.infer<typeof UserList>;
