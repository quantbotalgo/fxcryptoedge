"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { FlatCard } from "@/components/ui/Card";
import { GoogleButton } from "@/components/GoogleButton";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referredByCode, setReferredByCode] = useState(params.get("ref") || "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(name, email, password, referredByCode || undefined);
      router.push(params.get("next") || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[420px] px-8 py-16">
      <h1 className="mb-1 text-center font-display text-3xl font-bold tracking-tight">
        Create your account
      </h1>
      <p className="mb-8 text-center text-sm text-fg/60">Start free. Upgrade to a plan anytime.</p>

      <FlatCard className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg/60">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg/60">
              Referral code <span className="text-fg/35">(optional)</span>
            </label>
            <input
              value={referredByCode}
              onChange={(e) => setReferredByCode(e.target.value.toUpperCase())}
              className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 font-mono text-sm outline-none focus:border-accent"
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 rounded-[13px] bg-gradient-to-br from-accent to-accent-2 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,.32)] disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Start free"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-fg/40">
          <div className="h-px flex-1 bg-white/10" /> or <div className="h-px flex-1 bg-white/10" />
        </div>
        <GoogleButton onDone={() => router.push(params.get("next") || "/dashboard")} />
      </FlatCard>

      <p className="mt-5 text-center text-sm text-fg/60">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold">
          Log in
        </Link>
      </p>
    </section>
  );
}
