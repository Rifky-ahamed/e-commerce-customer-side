"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string; 
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else if (data) {
        setProduct({
          id: data.id,
          name: data.name,
          price: Number(data.price),
          description: data.description,
          image_url:
            data.image_url && data.image_url !== ""
              ? data.image_url
              : `https://via.placeholder.com/400x400?text=${encodeURIComponent(
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

  const handleAddToCart = async () => {
    await addToCart({
      id: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      image: product.image_url, 
    });
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 4000);
  };

  return (
    <main className="relative p-8 flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto bg-white shadow-lg rounded-2xl">
      
      <img
        src={product.image_url}
        alt={product.name}
        className="w-72 h-72 object-cover rounded-xl border"
      />

      
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-2xl font-semibold text-blue-600 mb-6">
          Rs.{product.price.toLocaleString()}
        </p>

        <button
          onClick={handleAddToCart}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition transform"
        >
          Add to Cart
        </button>

        <button
          onClick={() => router.push("/cart")}
          className="mt-5 px-6 py-2 rounded-lg border border-blue-600 text-blue-600 font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm active:scale-95"
        >
          🛍️ Go to Cart
        </button>
      </div>

      
      {showPopup && (
        <div
          onClick={() => router.push("/cart")}
          className="absolute top-5 right-5 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg cursor-pointer hover:bg-green-600 transition"
        >
          ✅ Successfully added <strong>{product.name}</strong> to your cart!
          <p className="text-sm mt-1 underline text-white/90">Click to view cart</p>
        </div>
      )}
    </main>
  );
}
