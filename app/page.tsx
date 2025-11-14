"use client";

import { useEffect, useState, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"; 
import { Button } from "@/components/ui/button"; 

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { cart, getTotal } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Prevent the toast from firing multiple times
  const toastShown = useRef(false);

  // 🔥 Show login / not-login popup
  useEffect(() => {
    if (!authLoading && !toastShown.current) {
      toastShown.current = true; // prevent duplicates

      if (user) {
        const username = user.email?.split("@")[0] || "User";
        toast.success(`You are logged in as ${username}`);
      } else {
        toast.error("You are not logged in to this website");
      }
    }
  }, [authLoading, user]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) console.error("Error fetching products:", error);
      else setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (authLoading) {
    return <p className="p-8 text-center">Checking login status...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navigation Menu */}
      <NavigationMenu className="bg-white shadow-md px-6 py-4 mb-6">
        <NavigationMenuList className="flex justify-between w-full items-center">
          <NavigationMenuItem>
            <NavigationMenuTrigger>MyStore</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink onClick={() => router.push("/")}>
                Dashboard
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <div className="flex gap-4 items-center">
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink onClick={() => router.push("/product")}>
                  View Products
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {user && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Cart ({cart.length})</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink onClick={() => router.push("/cart")}>
                      Go to Cart
                    </NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Checkout</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <NavigationMenuLink onClick={() => router.push("/checkout")}>
                      Proceed to Checkout
                    </NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </>
            )}

            {!user && (
              <>
                <Button onClick={() => router.push("/login")}>Login</Button>
                <Button variant="outline" onClick={() => router.push("/signup")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Dashboard Overview */}
      <main className="p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Website Overview</h2>

        {loading ? (
          <p>Loading stats...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Total Products */}
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Total Products</h3>
              <p className="text-3xl font-bold text-blue-600">{products.length}</p>
              <Button className="mt-4" onClick={() => router.push("/product")}>
                View Products
              </Button>
            </div>

            {/* Items in Cart */}
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Items in Cart</h3>
              <p className="text-3xl font-bold text-green-600">
                {user ? cart.length : 0}
              </p>
              {user && (
                <Button className="mt-4" onClick={() => router.push("/cart")}>
                  Go to Cart
                </Button>
              )}
            </div>

            {/* Total Cart Value */}
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Total Cart Value</h3>
              <p className="text-3xl font-bold text-red-500">
                Rs.{user ? getTotal().toLocaleString() : 0}
              </p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
