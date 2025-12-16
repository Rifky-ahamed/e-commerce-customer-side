import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { z } from "zod";

/* ------------------ ZOD SCHEMAS ------------------ */

const CartItemSchema = z.object({
  product_id: z.number(),
  quantity: z.number().min(1),
});

const CheckoutSchema = z.object({
  user_id: z.string(),
  items: z.array(CartItemSchema),
});

/* ------------------ API HANDLER ------------------ */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate request
    const { user_id, items } = CheckoutSchema.parse(body);

    if (items.length === 0) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

    /* -------- 1️⃣ Fetch product prices -------- */
    const productIds = items.map((i) => i.product_id);

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (productError || !products) {
      throw productError;
    }

    /* -------- 2️⃣ Calculate total -------- */
    const total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    /* -------- 3️⃣ Create order -------- */
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{ user_id, total }])
      .select()
      .single();

    if (orderError || !order) {
      throw orderError;
    }

    /* -------- 4️⃣ Insert order items -------- */
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: product?.price || 0,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    return NextResponse.json({
      message: "Order placed successfully",
      order_id: order.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
