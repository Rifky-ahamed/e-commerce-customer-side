import { z } from "../zod-setup";

/* -------- Order Item Schema -------- */
export const OrderProductSchema = z.object({
  name: z.string(),
});

/* -------- Order Items Schema -------- */
export const OrderItemSchema = z.object({
  quantity: z.number(),
  price: z.number(),
  product: OrderProductSchema,
});

/* -------- Single Order Schema -------- */
export const OrderSchema = z.object({
  id: z.number(),
  total: z.number(),
  created_at: z.string(),
  order_items: z.array(OrderItemSchema),
});

/* -------- Response Schema (Array of orders) -------- */
export const OrdersResponseSchema = z.array(OrderSchema);

/* -------- Types -------- */
export type Order = z.infer<typeof OrderSchema>;
export type OrdersResponse = z.infer<typeof OrdersResponseSchema>;
