"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  
  const ensureUserRow = async (supabaseUser: User) => {
    try {
      const { id, email, user_metadata } = supabaseUser;
      const name = (user_metadata as any)?.name || "";

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("role")
        .eq("id", id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
       
        throw fetchError;
      }

      if (!existingUser) {
        await supabase.from("users").insert({
          id,
          email,
          name,
          role: "user", // default
          created_at: new Date(),
        });
        setRole("user");
      } else {
        // Use existing role
        setRole(existingUser.role);
      }
    } catch (err) {
      console.error("Failed to ensure user row:", err);
      setRole("user"); 
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await ensureUserRow(currentUser);
      }

      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        ensureUserRow(authUser);
      } else {
        setRole(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, isAdmin: role === "admin" }}>
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
