import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import {
  CartProductsSchema,
  CartProductsResponseSchema,
} from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    
    const body = await req.json();

    
    const validation = CartProductsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { productIds } = validation.data;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image_url")
      .in("id", productIds);

    if (error) {
      return NextResponse.json(
        { message: "Failed to fetch cart products" },
        { status: 500 }
      );
    }

    
    const responseValidation =
      CartProductsResponseSchema.safeParse(data);

    if (!responseValidation.success) {
      return NextResponse.json(
        { message: "Invalid data from server" },
        { status: 500 }
      );
    }

    return NextResponse.json(responseValidation.data);
  } catch (err) {
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  }
}
