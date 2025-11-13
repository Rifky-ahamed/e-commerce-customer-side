"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, Session } from "@supabase/supabase-js";

// ✅ Define context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Ensure the Supabase user row exists in public.users
  const ensureUserRow = async (supabaseUser: User) => {
    try {
      const { id, email, user_metadata } = supabaseUser;

      // Use name from user_metadata if exists, else empty string
      const name = (user_metadata as any)?.name || "";

      // Upsert the user row
      await supabase.from("users").upsert({
        id,       // auth user ID
        email,
        name,     // store name if available
        created_at: new Date(),
      });
    } catch (err) {
      console.error("Failed to ensure user row in database:", err);
    }
  };

  useEffect(() => {
    // 1️⃣ Get initial user
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setUser(data.user);
        await ensureUserRow(data.user);
      }
      setLoading(false);
    };

    getUser();

    // 2️⃣ Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await ensureUserRow(currentUser); // upsert on every login/signup
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
