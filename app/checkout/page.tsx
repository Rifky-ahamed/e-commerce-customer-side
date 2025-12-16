"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
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

  
  const loadProducts = async () => {
  if (cart.length === 0) {
    setProducts([]);
    return;
  }

  const response = await fetch("/api/products/by-ids", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ids: cart.map((item) => item.id),
    }),
  });

  const data = await response.json();
  setProducts(data);
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
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    await clearCart();
    setSuccess("✅ Order placed successfully!");
    setTimeout(() => router.push("/"), 2000);
  } catch (err: any) {
    setError(err.message || "Something went wrong");
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
