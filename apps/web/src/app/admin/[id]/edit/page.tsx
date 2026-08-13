"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AdminGuard } from "../../AdminGuard";
import { SignalForm, type SignalFormValues } from "../../SignalForm";
import type { Signal } from "@/lib/types";

const MARKET_LABELS: Record<SignalFormValues["market"], string> = {
  FOREX: "FOREX",
  CRYPTO: "CRYPTO",
  XAUUSD: "GOLD",
};

function EditSignalPageInner() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [signal, setSignal] = useState<Signal | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get<{ signal: Signal }>(`/api/signals/${params.id}`)
      .then((data) => setSignal(data.signal))
      .catch(() => setNotFound(true));
  }, [params.id]);

  async function handleSave(values: SignalFormValues) {
    await api.patch(`/api/signals/${params.id}`, {
      ...values,
      marketLabel: MARKET_LABELS[values.market],
      tp2: values.tp2 || undefined,
      tp3: values.tp3 || undefined,
    });
    router.push("/admin");
  }

  if (notFound) {
    return (
      <section className="mx-auto max-w-[560px] px-5 sm:px-8 py-20 text-center text-fg/50">
        Signal not found.
      </section>
    );
  }

  if (!signal) {
    return (
      <section className="mx-auto max-w-[560px] px-5 sm:px-8 py-20 text-center text-fg/50">Loading…</section>
    );
  }

  return (
    <SignalForm
      title={`Edit ${signal.pair}`}
      submitLabel="Save changes"
      onSubmit={handleSave}
      initial={{
        market: signal.market,
        action: signal.action,
        pair: signal.pair,
        entry: signal.entry ?? "",
        stopLoss: signal.stopLoss ?? "",
        tp1: signal.tp1 ?? "",
        tp2: signal.tp2 ?? "",
        tp3: signal.tp3 ?? "",
        confidence: signal.confidence,
        note: signal.note ?? "",
        icon: signal.icon,
        iconBg: signal.iconBg,
      }}
    />
  );
}

export default function EditSignalPage() {
  return (
    <AdminGuard>
      <EditSignalPageInner />
    </AdminGuard>
  );
}
