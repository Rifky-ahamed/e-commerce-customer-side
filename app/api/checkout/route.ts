import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  CheckoutSchema,
  CheckoutResponseSchema,
} from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = CheckoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { user_id, items } = validation.data;

    const productIds = items.map((i) => i.product_id);

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, price")
      .in("id", productIds);

    if (productError || !products) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    const total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

  
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{ user_id, total }])
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

  
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
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

   
    const response = CheckoutResponseSchema.parse({
      message: "Order placed successfully",
      order_id: order.id,
    });

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
