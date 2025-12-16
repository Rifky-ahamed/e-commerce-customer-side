import { z } from "../zod-setup";

/**
 * Cart item (request)
 */
export const CheckoutItemSchema = z.object({
  product_id: z
    .number()
    .int()
    .positive()
    .describe("Product ID"),
  quantity: z
    .number()
    .int()
    .min(1)
    .describe("Quantity of the product"),
});

/**
 * Checkout request schema
 */
export const CheckoutSchema = z.object({
  user_id: z.string().describe("User ID"),
  items: z
    .array(CheckoutItemSchema)
    .min(1)
    .describe("List of cart items"),
});


export const CheckoutResponseSchema = z.object({
  message: z.string(),
  order_id: z.number(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
