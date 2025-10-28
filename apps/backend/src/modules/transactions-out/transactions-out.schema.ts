import z from "zod";

export const CreateTransactionOut = z.object({
  productId: z
    .uuid("Product ID tidak valid")
    .nonempty("Product ID tidak boleh kosong"),
  warehouseId: z
    .uuid("Warehouse ID tidak valid")
    .nonempty("Warehouse ID tidak boleh kosong"),
  invoice: z.string("Invoice tidak valid").min(1, "Invoice tidak boleh kosong"),
  amount: z
    .number("Jumlah barang tidak valid")
    .min(1, "Jumlah barang tidak boleh kosong"),
  purpose: z.string("Tujuan tidak valid").min(1, "Tujuan tidak boleh kosong"),
  exitDate: z.date("Tanggal tidak valid").optional(),
});

export const TransactionOutEntity = z.object({
  id: z.uuid(),
  product: z.object({
    id: z.uuid(),
    name: z.string(),
    code: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  warehouse: z.object({
    id: z.uuid(),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  invoice: z.string(),
  amount: z.number(),
  purpose: z.string(),
  exitDate: z.date(),
  createdAt: z.date(),
});

export const TransactionOutList = z.object({
  items: z.array(TransactionOutEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export const TransactionOutIdParam = z.object({ id: z.uuid() });

export type CreateTransactionOut = z.infer<typeof CreateTransactionOut>;
export type TransactionOutEntity = z.infer<typeof TransactionOutEntity>;
export type TransactionOutList = z.infer<typeof TransactionOutList>;
export type TransactionOutIdParam = z.infer<typeof TransactionOutIdParam>;
