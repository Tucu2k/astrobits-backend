import { z } from "zod";

export const createProductSchema = z.object({
  id: z.number().positive(),
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
  category: z.string().trim().min(1),
  stock: z.number().nonnegative(),
  image: z.string().trim().min(1).optional()
}).strict();

export const updateProductSchema = z.object({
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
  category: z.string().trim().min(1),
  stock: z.number().nonnegative(),
  image: z.string().trim().min(1).optional()
}).strict();

export const purchaseSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().int().positive()
}).strict();

export const purchaseMultipleSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int().positive(),
      quantity: z.number().int().positive()
    }).strict()
  ).min(1)
}).strict();

export type PurchaseMultiple = z.infer<typeof purchaseMultipleSchema>;

export const patchProductSchema = updateProductSchema.partial().strict();

export type CreateProduct = z.infer<typeof createProductSchema>;

export type UpdateProduct = z.infer<typeof updateProductSchema>;

export type PatchProduct = z.infer<typeof patchProductSchema>;

export type Purchase = z.infer<typeof purchaseSchema>;