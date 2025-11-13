"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // ✅ User already exists in 'users' table via AuthContext
      // Fetch user row
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (userError || !userData) throw new Error("User not found in database");

      const userId = userData.id;

      // 1️⃣ Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{ user_id: userId, total: getTotal() }])
        .select()
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;

      // 2️⃣ Insert order items
      const orderItems = cart.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // 3️⃣ Clear cart
      clearCart();

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
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between border-b pb-2">
                <span>{item.name} x {item.quantity}</span>
                <span>Rs.{(item.price * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total:</span>
            <span>Rs.{getTotal().toLocaleString()}</span>
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
