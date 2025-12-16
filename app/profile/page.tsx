"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";


interface OrderItem {
  quantity: number;
  price: number;
  product: {
    name: string;
  } | null;
}

interface Order {
  id: string;
  total: number;
  created_at: string;
  order_items: OrderItem[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("You are not logged in!");
      router.push("/login");
    }
  }, [authLoading, user, router]);

  
 useEffect(() => {
  const fetchOrders = async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/profile", {
        headers: { "x-user-id": user.id },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        setOrders([]);
      } else {
        
        const typedOrders: Order[] = (data || []).map((order: any) => ({
          id: order.id,
          total: order.total,
          created_at: order.created_at,
          order_items: (order.order_items || []).map((item: any) => ({
            quantity: item.quantity,
            price: item.price,
            product: { name: item.product?.name || "Unknown" },
          })),
        }));

        setOrders(typedOrders);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, [user]);

  if (authLoading || !user) {
    return <p className="p-8 text-center">Checking login status...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Info</h2>
        <p><strong>Name:</strong> {user.user_metadata?.name || "N/A"}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>

        <Button
          className="mt-4"
          onClick={() =>
            supabase.auth.signOut().then(() => {
              toast.success("Logged out successfully");
              router.push("/");
            })
          }
        >
          Logout
        </Button>
      </div>

      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Past Orders</h2>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No past orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Order ID</th>
                  <th className="border px-4 py-2">Products</th>
                  <th className="border px-4 py-2">Quantities</th>
                  <th className="border px-4 py-2">Total Price</th>
                  <th className="border px-4 py-2">Order Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="border px-4 py-2">{order.id}</td>

                   
                    <td className="border px-4 py-2">
                      {order.order_items.map((item, idx) => (
                        <div key={idx}>{item.product?.name || "Unknown Product"}</div>
                      ))}
                    </td>

                    
                    <td className="border px-4 py-2">
                      {order.order_items.map((item, idx) => (
                        <div key={idx}>{item.quantity}</div>
                      ))}
                    </td>

                    <td className="border px-4 py-2">
                      Rs.{(order.total ?? 0).toLocaleString()}
                    </td>

                    <td className="border px-4 py-2">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
