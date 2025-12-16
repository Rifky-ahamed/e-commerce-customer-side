import { z } from "../zod-setup";

/* ------------------ Request schema ------------------ */
export const ProductsByIdRequestSchema = z.object({
  ids: z
    .array(z.number().int().positive())
    .min(1)
    .describe("List of product IDs to fetch"),
});

/* ------------------ Single product schema ------------------ */
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  stock: z.number().nullable().optional(),
  category_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/* ------------------ Response schema ------------------ */
export const ProductsByIdResponseSchema = z.array(ProductSchema);

/* ------------------ Types ------------------ */
export type ProductsByIdRequest = z.infer<typeof ProductsByIdRequestSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductsByIdResponse = z.infer<typeof ProductsByIdResponseSchema>;
