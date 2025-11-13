"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

export default function ProductDetailsPage() {
  const { id } = useParams(); // get dynamic product ID from URL
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct({
          id: data.id.toString(),
          name: data.name,
          price: Number(data.price),
          description: data.description,
          image_url:
            data.image_url ||
            `https://via.placeholder.com/400x400?text=${encodeURIComponent(
              data.name
            )}`,
        });
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) return <p className="p-8 text-center">Loading product...</p>;
  if (!product) return <p className="p-8 text-center">Product not found.</p>;

  return (
    <main className="p-8 flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto bg-white shadow-lg rounded-2xl">
      {/* 🖼️ Product Image */}
      <img
        src={product.image_url}
        alt={product.name}
        className="w-72 h-72 object-cover rounded-xl border"
      />

      {/* 🧾 Product Info */}
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-2xl font-semibold text-blue-600 mb-6">
          Rs.{product.price.toLocaleString()}
        </p>

        {/* 🛒 Add to Cart Button */}
        <button
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              image: product.image_url,
            })
          }
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add to Cart
        </button>
      </div>
    </main>
  );
}
