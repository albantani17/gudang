import z from "zod";

export const WareHouseIdParam = z.object({ id: z.uuid("ID tidak valid") });

export const CreateWareHouse = z.object({
  name: z.string().min(1, "Nama tidak boleh kosong"),
});

export const UpdateWareHouse = z.object({
  name: z.string("Nama harus berupa string").optional(),
});

export const WareHouseEntity = z.object({
  id: z.uuid(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WareHouseList = z.object({
  items: z.array(WareHouseEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateWareHouse = z.infer<typeof CreateWareHouse>;
export type UpdateWareHouse = z.infer<typeof UpdateWareHouse>;
export type WareHouseEntity = z.infer<typeof WareHouseEntity>;
export type WareHouseList = z.infer<typeof WareHouseList>;
