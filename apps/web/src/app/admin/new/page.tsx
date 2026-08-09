"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AdminGuard } from "../AdminGuard";
import { SignalForm, type SignalFormValues } from "../SignalForm";

const MARKET_LABELS: Record<SignalFormValues["market"], string> = {
  FOREX: "FOREX",
  CRYPTO: "CRYPTO",
  XAUUSD: "GOLD",
};

function NewSignalPageInner() {
  const router = useRouter();

  async function handleCreate(values: SignalFormValues) {
    await api.post("/api/signals", {
      ...values,
      marketLabel: MARKET_LABELS[values.market],
      tp2: values.tp2 || undefined,
      tp3: values.tp3 || undefined,
    });
    router.push("/admin");
  }

  return <SignalForm title="New signal" submitLabel="Post signal" onSubmit={handleCreate} />;
}

export default function NewSignalPage() {
  return (
    <AdminGuard>
      <NewSignalPageInner />
    </AdminGuard>
  );
}
