import type { Metadata } from "next";
import { API_URL } from "@/lib/api";
import type { Plan } from "@/lib/types";
import { PricingClient } from "./PricingClient";
import { WhyAndCta } from "@/components/WhyAndCta";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for forex, crypto, and gold trading signals. Monthly, quarterly, and annual plans priced in ₹. Cancel anytime.",
  alternates: { canonical: "/pricing" },
};

async function getPlans(): Promise<Plan[]> {
  try {
    const res = await fetch(`${API_URL}/api/plans`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.plans as Plan[];
  } catch {
    return [];
  }
}

export default async function PricingPage() {
  const plans = await getPlans();
  return (
    <>
      <PricingClient plans={plans} />
      <WhyAndCta />
    </>
  );
}
