import z from "zod";
import { ProductEntity } from "../products/products.schema";
import { SupplierEntity } from "../suppliers/suppliers.schema";
import { WareHouseEntity } from "../warehouses/warehouses.schema";

export const CreateTransactionIn = z.object({
  productId: z
    .uuid("Product ID tidak valid")
    .nonempty("Product ID tidak boleh kosong"),
  supplierId: z
    .uuid("Supplier ID tidak valid")
    .nonempty("Supplier ID tidak boleh kosong"),
  warehouseId: z
    .uuid("Warehouse ID tidak valid")
    .nonempty("Warehouse ID tidak boleh kosong"),
  invoice: z.string("Invoice tidak valid").min(1, "Invoice tidak boleh kosong"),
  amount: z.number("Jumlah barang tidak valid").min(1, "Jumlah barang tidak boleh kosong"),
  date: z.date("Tanggal tidak valid").optional(),
});

export const TransactionInEntity = z.object({
  id: z.uuid(),
  product: z.object({
    id: z.uuid(),
    name: z.string(),
    code: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  supplier: SupplierEntity,
  warehouse: WareHouseEntity,
  invoice: z.string(),
  amount: z.number(),
  date: z.date(),
  createdAt: z.date(),
});

export const TransactionInList = z.object({
  items: z.array(TransactionInEntity),
  total: z.number(),
  pagination: z.object({
    limit: z.number(),
    currentPage: z.number(),
    totalPages: z.number(),
  }),
});

export const TransactionIdParam = z.object({ id: z.uuid() });

export type CreateTransactionIn = z.infer<typeof CreateTransactionIn>;
export type TransactionInEntity = z.infer<typeof TransactionInEntity>;
export type TransactionInList = z.infer<typeof TransactionInList>;
export type TransactionIdParam = z.infer<typeof TransactionIdParam>;
