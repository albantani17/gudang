import z from "zod";

export const CreateAsset = z.object({
  serialNumber: z
    .string("Serial number harus berupa string")
    .min(1, "Serial number tidak boleh kosong"),
  macAddress: z
    .string("Mac address harus berupa string")
    .min(1, "Mac address tidak boleh kosong"),
  productId: z
    .uuid("Product ID tidak valid")
    .nonempty("Product ID tidak boleh kosong"),
  assetAreaId: z
    .uuid("Asset area ID tidak valid")
    .nonempty("Asset area ID tidak boleh kosong"),
  serviceType: z
    .enum(["HOTSPOT", "PPPOE"], "Service type harus HOTSPOT atau PPPOE")
    .nonoptional("Service type tidak boleh kosong"),
  ownerAsset: z
    .enum(["PERUSAHAAN", "AGEN"], "Owner asset harus PERUSAHAAN atau AGEN")
    .nonoptional("Owner asset tidak boleh kosong"),
  orderDate: z.date("Tanggal tidak valid").optional(),
  technician: z
    .string("Teknisi tidak valid")
    .nonempty("Teknisi tidak boleh kosong"),
  latitude: z
    .number("Latitude tidak valid")
    .nonoptional("Latitude tidak boleh kosong"),
  longitude: z
    .number("Longitude tidak valid")
    .nonoptional("Longitude tidak boleh kosong"),
  description: z.string("Keterangan tidak valid").optional(),
});

export const AssetEntity = z.object({
  id: z.uuid(),
  serialNumber: z.string(),
  macAddress: z.string(),
  product: z.object({
    id: z.uuid(),
    name: z.string(),
    code: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  assetArea: z.object({
    id: z.uuid(),
    name: z.string(),
    code: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  serviceType: z.enum(["HOTSPOT", "PPPOE"]),
  ownerAsset: z.enum(["PERUSAHAAN", "AGEN"]),
  orderDate: z.date(),
  technician: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AssetList = z.object({
  items: z.array(AssetEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export const ReturnAsset = z.object({
  condition: z
    .enum(["GOOD", "BROKEN"], "Condition harus GOOD atau BROKEN")
    .nonoptional("Condition harus diisi"),
  information: z
    .string("Informasi harus berupa string")
    .nonoptional("Informasi harus diisi"),
});

export const AssetIdParam = z.object({ id: z.uuid() });

export type CreateAssetBody = z.infer<typeof CreateAsset>;

export type AssetEntity = z.infer<typeof AssetEntity>;

export type AssetList = z.infer<typeof AssetList>;

export type ReturnAssetBody = z.infer<typeof ReturnAsset>;
