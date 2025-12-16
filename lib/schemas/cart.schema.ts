import { z } from "../zod-setup";

/**
 * Request schema
 * POST /api/cart
 */
export const CartProductsSchema = z.object({
  productIds: z
     .array(z.number().int().positive())
    .min(1)
    .describe("List of product IDs to fetch cart items"),
});

/**
 * Response item schema
 */
export const CartProductSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  price: z.number(),
  image_url: z.string().url().nullable(),
});


export const CartProductsResponseSchema = z.array(CartProductSchema);


export type CartProductsInput = z.infer<typeof CartProductsSchema>;
export type CartProduct = z.infer<typeof CartProductSchema>;
export type CartProductsResponse = z.infer<
  typeof CartProductsResponseSchema
>;
