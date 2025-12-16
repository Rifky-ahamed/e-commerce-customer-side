import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { ids } = await req.json();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price")
    .in("id", ids);

  if (error) {
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
