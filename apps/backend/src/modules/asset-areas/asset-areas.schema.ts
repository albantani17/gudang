import z from "zod";

export const CreateAssetArea = z.object({
  name: z.string(),
  code: z.string(),
});

export const UpdateAssetArea = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
});

export const AssetAreaIdParam = z.object({ id: z.uuid() });

export const AssetAreaEntity = z.object({
  id: z.uuid(),
  name: z.string(),
  code: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AssetAreaList = z.object({
  items: z.array(AssetAreaEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export type CreateAssetArea = z.infer<typeof CreateAssetArea>;
export type UpdateAssetArea = z.infer<typeof UpdateAssetArea>;
export type AssetAreaIdParam = z.infer<typeof AssetAreaIdParam>;
export type AssetAreaEntity = z.infer<typeof AssetAreaEntity>;
export type AssetAreaList = z.infer<typeof AssetAreaList>;
