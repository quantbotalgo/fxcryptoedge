"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { FlatCard } from "@/components/ui/Card";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[420px] px-5 sm:px-8 py-16">
      <h1 className="mb-1 text-center font-display text-3xl font-bold tracking-tight">
        Reset password
      </h1>
      <p className="mb-8 text-center text-sm text-fg/60">Choose a new password for your account.</p>

      <FlatCard className="p-6">
        {!token ? (
          <p className="text-center text-sm text-danger">
            This link is missing a reset token. Request a new one from the{" "}
            <Link href="/forgot-password" className="font-semibold">
              forgot password
            </Link>{" "}
            page.
          </p>
        ) : done ? (
          <p className="text-center text-sm text-fg/75">
            Password updated. Redirecting you to log in…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg/60">New password</label>
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
              <label className="mb-1.5 block text-xs font-medium text-fg/60">Confirm password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-[13px] bg-gradient-to-br from-accent to-accent-2 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,.32)] disabled:opacity-60"
            >
              {busy ? "Saving…" : "Reset password"}
            </button>
          </form>
        )}
      </FlatCard>
    </section>
  );
}
