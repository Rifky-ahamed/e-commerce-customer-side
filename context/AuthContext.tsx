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

  // ✅ Ensure user row in DB (runs in background)
// ✅ Ensure user row in DB (runs in background)
const ensureUserRow = async (supabaseUser: User) => {
  try {
    const { id, email, user_metadata } = supabaseUser;
    const name = (user_metadata as any)?.name || "";

    // Await the upsert
    await supabase.from("users").upsert({
      id,
      email,
      name,
      created_at: new Date(),
    });

  } catch (err) {
    console.error("Failed to ensure user row:", err);
  }
};


  useEffect(() => {
    const loadSession = async () => {
      // 1️⃣ Get session immediately
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 2️⃣ Ensure user row asynchronously
      if (currentUser) {
        ensureUserRow(currentUser); // no await → non-blocking
      }

      // 3️⃣ Stop loading immediately
      setLoading(false);
    };

    loadSession();

    // 4️⃣ Listen for login/logout/session changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        ensureUserRow(authUser); // background upsert
      }
    });

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
