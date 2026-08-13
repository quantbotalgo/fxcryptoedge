"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { FlatCard } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[420px] px-5 sm:px-8 py-16">
      <h1 className="mb-1 text-center font-display text-3xl font-bold tracking-tight">
        Forgot password
      </h1>
      <p className="mb-8 text-center text-sm text-fg/60">
        We&apos;ll email you a link to reset it.
      </p>

      <FlatCard className="p-6">
        {sent ? (
          <p className="text-center text-sm text-fg/75">
            If that email has an account, a reset link has been sent. Check your inbox.
          </p>
        ) : (
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
            {error && <p className="text-xs text-danger">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-[13px] bg-gradient-to-br from-accent to-accent-2 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,.32)] disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </FlatCard>

      <p className="mt-5 text-center text-sm text-fg/60">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold">
          Log in
        </Link>
      </p>
    </section>
  );
}
