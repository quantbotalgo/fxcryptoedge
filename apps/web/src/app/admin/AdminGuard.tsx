"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/admin");
    else if (user.role !== "ADMIN") router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return <section className="mx-auto max-w-[720px] px-5 sm:px-8 py-20 text-center text-fg/50">Loading…</section>;
  }

  return <>{children}</>;
}
