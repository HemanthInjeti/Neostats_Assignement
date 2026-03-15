"use client";

import { AuthProvider } from "@/hooks/use-auth";

export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
