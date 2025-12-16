import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  ProductsByIdRequestSchema,
  ProductsByIdResponseSchema,
} from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validation = ProductsByIdRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { ids } = validation.data;

    const { data, error } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", ids);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    const response = ProductsByIdResponseSchema.parse(data);

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
