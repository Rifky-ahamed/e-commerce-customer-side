"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, Session } from "@supabase/supabase-js";

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

  // Ensure user exists inside your `users` table
  const ensureUserRow = async (supabaseUser: User) => {
    try {
      const { id, email, user_metadata } = supabaseUser;

      const name = (user_metadata as any)?.name || "";

      await supabase.from("users").upsert({
        id,
        email,
        name,
        created_at: new Date(),
      });
    } catch (err) {
      console.error("Failed to ensure user row in DB:", err);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      // 1️⃣ Load session instantly from cache (FAST)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // If user exists → ensure user row
      if (currentUser) {
        await ensureUserRow(currentUser);
      }

      setLoading(false); // Finished checking
    };

    loadSession();

    // 2️⃣ Listen for any login/logout/session refresh
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session: Session | null) => {
        const authUser = session?.user ?? null;
        setUser(authUser);

        if (authUser) {
          await ensureUserRow(authUser);
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
