"use client";

import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotal } = useCart();

  if (cart.length === 0) {
    return (
      <main className="p-8 text-center text-gray-600">
        <h1 className="text-2xl font-bold mb-3">🛒 Your Cart is Empty</h1>
        <p>Start adding some products!</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-4xl mx-auto bg-white shadow-md rounded-2xl">
      <h1 className="text-2xl font-bold mb-6">🛒 Your Cart</h1>

      <ul className="space-y-4">
        {cart.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.image || "/placeholder.png"}
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

            {/* Quantity Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="bg-gray-200 px-2 rounded"
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="bg-gray-200 px-2 rounded"
              >
                +
              </button>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Total & Clear Cart */}
      <div className="mt-8 text-right">
        <p className="text-xl font-semibold mb-3">
          Total: Rs.{getTotal().toLocaleString()}
        </p>
        <button
          onClick={clearCart}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Clear Cart
        </button>
      </div>
    </main>
  );
}
