"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string; 
}

export default function CartPage() {
  const { cart, removeFromCart, clearCart, getTotal } = useCart();
  const [cartProducts, setCartProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  
  const loadCartProducts = async () => {
  if (cart.length === 0) {
    setCartProducts([]);
    setLoading(false);
    return;
  }

  setLoading(true);

  const response = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productIds: cart.map((item) => item.id),
    }),
  });

  const products = await response.json();

  setCartProducts(
    products.map((p: any) => ({
      id: p.id,
      name: p.name || "Unknown Product",
      price: Number(p.price) || 0,
      image: p.image_url || "/placeholder.png",
    }))
  );

  setLoading(false);
};

  useEffect(() => {
    loadCartProducts();
  }, [cart]);

  if (loading) {
    return <p className="p-8 text-center">Loading cart...</p>;
  }

  if (cart.length === 0) {
    return (
      <main className="p-8 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-3">🛒 Your Cart is Empty</h1>
        <p>Start adding some products!</p>
      </main>
    );
  }

  
  const mergedCart = cart.map((item) => {
    const product = cartProducts.find((p) => p.id === item.id);
    return {
      ...item,
      name: product?.name || "Unknown Product",
      price: product?.price || 0,
      image: product?.image || "/placeholder.png",
    };
  });

  const handleRemove = async (id: number) => {
    await removeFromCart(id);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  return (
    <main className="p-8 max-w-4xl mx-auto bg-white shadow-md rounded-2xl">
      <h1 className="text-2xl font-bold mb-6">🛒 Your Cart</h1>

      <ul className="space-y-4">
        {mergedCart.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-blue-600 font-medium">
                  Rs.{item.price.toLocaleString()}
                </p>
              </div>
            </div>

            
            <div className="flex items-center gap-3">
              <span>Qty: {item.quantity}</span>
              <button
                onClick={() => handleRemove(item.id)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      
      <div className="mt-8 text-right">
        <p className="text-xl font-semibold mb-3">Total Items: {getTotal()}</p>
        <button
          onClick={handleClearCart}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Clear Cart
        </button>
      </div>
    </main>
  );
}
