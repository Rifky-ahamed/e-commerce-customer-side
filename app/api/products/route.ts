// pages/api/products.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, description, price, stock, category_id, image_file_name } = req.body;

    if (!name || !price || !category_id || !image_file_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }


    const { data } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(image_file_name);

    if (!data?.publicUrl) throw new Error("Failed to get public URL");

 
    const { error: insertError } = await supabaseAdmin.from("products").insert({
      name,
      description: description || "",
      price,
      stock: stock || 0,
      category_id,
      image_url: data.publicUrl,
      created_at: new Date(),
    });

    if (insertError) throw insertError;

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Insert error:", err);
    return res.status(500).json({ error: err.message });
  }
}
