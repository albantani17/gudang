import { z } from "zod";

export const UserIdParam = z.object({
  id: z.uuid(),
});

export const CreateUserBody = z.object({
  email: z.email("Email tidak valid").nonempty("Email tidak boleh kosong"),
  name: z.string("Name tidak valid").nonempty("Name tidak boleh kosong"),
  username: z
    .string("Username tidak valid")
    .nonempty("Username tidak boleh kosong"),
  password: z
    .string("Password tidak valid")
    .min(8)
    .nonempty("Password tidak boleh kosong"),
  roleId: z.uuid("Role ID tidak valid").nonempty("Role ID tidak boleh kosong"),
});

export const UpdateUserBody = z.object({
  email: z.email("Email tidak valid").optional(),
  name: z.string("Name tidak valid").optional(),
  username: z.string("Username tidak valid").optional(),
  password: z.string("Password tidak valid").optional(),
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
