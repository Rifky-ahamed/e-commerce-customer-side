"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) {
        setError("Login failed. Please check your credentials.");
        return;
      }

      const userId = authData.user.id;

      // 2️⃣ Fetch user role from your users table
      const { data: userRecord, error: dbError } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single(); // fetch a single record

      if (dbError) throw dbError;
      if (!userRecord) throw new Error("User role not found!");

      const role = userRecord.role;

      // 3️⃣ Redirect based on role (you can customize)
      if (role === "admin") {
        router.push("/admin"); // admin dashboard page
      } else {
        router.push("/"); // normal user dashboard
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    router.push("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <Button
          type="submit"
          className="w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleSignupRedirect}
          className="w-full"
        >
          Sign Up
        </Button>
      </form>
    </div>
  );
}