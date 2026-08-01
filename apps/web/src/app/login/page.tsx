"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { FlatCard } from "@/components/ui/Card";
import { GoogleButton } from "@/components/GoogleButton";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.push(params.get("next") || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[420px] px-8 py-16">
      <h1 className="mb-1 text-center font-display text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mb-8 text-center text-sm text-fg/60">Log in to view your signals and account.</p>

      <FlatCard className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg/60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg/60">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-[13px] bg-gradient-to-br from-accent to-accent-2 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,.32)] disabled:opacity-60"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-fg/40">
          <div className="h-px flex-1 bg-white/10" /> or <div className="h-px flex-1 bg-white/10" />
        </div>
        <GoogleButton onDone={() => router.push(params.get("next") || "/dashboard")} />
      </FlatCard>

      <p className="mt-5 text-center text-sm text-fg/60">
        No account yet?{" "}
        <Link href="/signup" className="font-semibold">
          Start free
        </Link>
      </p>
    </section>
  );
}
