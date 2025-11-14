"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  price: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch product details for cart items
  const loadProducts = async () => {
    if (cart.length === 0) {
      setProducts([]);
      return;
    }

    const ids = cart.map((item) => item.id);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", ids);

    if (!error && data) {
      setProducts(data.map(p => ({ id: p.id, name: p.name, price: Number(p.price) })));
    } else {
      console.error("Error fetching product details:", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [cart]);

  if (authLoading) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">You must be logged in to checkout</h2>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    );
  }

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1️⃣ Create order with total price
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{ user_id: user.id, total: totalPrice }])
        .select()
        .single();

      if (orderError || !orderData) throw orderError || new Error("Failed to create order");

      const orderId = orderData.id;

      // 2️⃣ Prepare order items
      const orderItems = cart.map((item) => {
        const product = products.find((p) => p.id === item.id);
        return {
          order_id: orderId,
          product_id: item.id,
          quantity: item.quantity,
          price: product?.price || 0,
        };
      });

      // 3️⃣ Insert order items
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // 4️⃣ Clear cart
      await clearCart();

      setSuccess("✅ Order placed successfully!");
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto bg-white shadow-md rounded-xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.id);
              return (
                <li key={item.id} className="flex justify-between border-b pb-2">
                  <span>{product?.name || "Unknown Product"} x {item.quantity}</span>
                  <span>Rs.{((product?.price || 0) * item.quantity).toLocaleString()}</span>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total:</span>
            <span>Rs.{totalPrice.toLocaleString()}</span>
          </div>

          {error && <p className="text-red-500 mb-3">{error}</p>}
          {success && <p className="text-green-500 mb-3">{success}</p>}

          <Button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? "Processing..." : "Place Order"}
          </Button>
        </>
      )}
    </div>
  );
}
