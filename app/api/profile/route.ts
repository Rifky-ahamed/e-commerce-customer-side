import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { OrdersResponseSchema } from "@/lib/schemas";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id"); // frontend sends user id
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        total,
        created_at,
        order_items (
          quantity,
          price,
          product:products(name)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ✅ Validate response
    const response = OrdersResponseSchema.parse(data || []);

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
