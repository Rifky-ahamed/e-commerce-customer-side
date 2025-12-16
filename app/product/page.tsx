"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url?: string;
}

export default function ProductListingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setIsLoggedIn(true);
      else setIsLoggedIn(false);
    };

    checkUser();
  }, []);

  
  const handleLogout = async () => {
    if (!isLoggedIn) {
      alert("❌ You are not logged in. Please login first.");
      return;
    }

    localStorage.clear();
    sessionStorage.clear();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      alert("Error while logging out!");
    } else {
      alert("Logout successful!");
      router.push("/");
    }
  };

  
  useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/fetch");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("API fetch error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);


  return (
    <main className="p-8">
    
      <div className="flex justify-end mb-6">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading && (
          <p className="text-center col-span-full">Loading products...</p>
        )}
        {!loading && products.length === 0 && (
          <p className="text-center col-span-full">No products found.</p>
        )}

        {!loading &&
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white shadow-md rounded-2xl p-4 flex flex-col items-center text-center"
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-48 h-48 object-cover rounded-lg mb-3"
              />
              <h2 className="font-semibold text-lg">{product.name}</h2>
              <p className="text-gray-600 text-sm">{product.description}</p>
              <p className="mt-2 font-bold text-blue-600">
                Rs.{product.price.toLocaleString()}
              </p>
              <Link
                href={`/product/${product.id}`}
                className="mt-3 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                View
              </Link>
            </div>
          ))}
      </div>
    </main>
  );
}
