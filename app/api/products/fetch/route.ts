import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { ProductsResponseSchema } from "@/lib/schemas/products.schema";

export async function GET() {
  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Failed to fetch products" }, { status: 500 });
    }

    const formattedData = data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      price: Number(item.price),
      description: item.description || null,
      image_url:
        item.image_url ||
        `https://via.placeholder.com/300x300?text=${encodeURIComponent(item.name)}`,
    }));

    // ✅ Validate response
    const response = ProductsResponseSchema.parse(formattedData);

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
