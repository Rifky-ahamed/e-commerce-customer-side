"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";

// ✅ CartItem now includes name, price, and image as required
export interface CartItem {
  id: number;        // product id
  quantity: number;
  name: string;
  price: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart for current user
  const loadCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }

    const { data, error } = await supabase
      .from("cart")
      .select(`
        product_id,
        quantity,
        products(name, price, image_url)
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading cart:", error);
      return;
    }

    if (data) {
      const formattedCart = data.map((item: any) => ({
        id: item.product_id,
        quantity: item.quantity,
        name: item.products.name,
        price: Number(item.products.price),
        image: item.products.image_url || "/placeholder.png",
      }));
      setCart(formattedCart);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  // Add a product to cart
  const addToCart = async (product: CartItem) => {
    if (!user) return;

    // Check if item already exists
    const { data: existing } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart")
        .update({ quantity: existing.quantity + product.quantity })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("cart")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: product.quantity,
        });
    }

    await loadCart();
  };

  const removeFromCart = async (productId: number) => {
    if (!user) return;

    await supabase
      .from("cart")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    await loadCart();
  };

  const clearCart = async () => {
    if (!user) return;

    await supabase
      .from("cart")
      .delete()
      .eq("user_id", user.id);

    setCart([]);
  };

  
  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, getTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
