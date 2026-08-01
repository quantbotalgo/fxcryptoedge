import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import type { Signal } from "@/lib/types";
import { SignalsClient } from "./SignalsClient";
import { WhyAndCta } from "@/components/WhyAndCta";

async function getSignals(): Promise<Signal[]> {
  try {
    // This is a server-side fetch (Node -> Express), so the browser never
    // attaches the auth cookie automatically. Forward it manually so the API
    // knows who's asking and can unlock signals the viewer is entitled to.
    const cookieHeader = cookies()
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(`${API_URL}/api/signals`, {
      cache: "no-store",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.signals as Signal[];
  } catch {
    return [];
  }
}

export default async function SignalsPage() {
  const signals = await getSignals();
  return (
    <>
      <SignalsClient signals={signals} />
      <WhyAndCta />
    </>
  );
}
