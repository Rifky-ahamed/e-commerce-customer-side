import { z } from "../zod-setup";

/**
 * Product item schema
 */
export const ProductSchemaItem = z.object({
  id: z.string().describe("Product ID"),
  name: z.string().describe("Product name"),
  price: z.number().describe("Product price"),
  description: z.string().nullable().describe("Product description"),
  image_url: z.string().url().nullable().describe("Product image URL"),
});

/**
 * Response schema
 * Array of products
 */
export const ProductsResponseSchema = z.array(ProductSchemaItem);

/**
 * Types
 */
export type ProductItem = z.infer<typeof ProductSchemaItem>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
