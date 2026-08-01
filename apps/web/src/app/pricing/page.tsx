import { API_URL } from "@/lib/api";
import type { Plan } from "@/lib/types";
import { PricingClient } from "./PricingClient";
import { WhyAndCta } from "@/components/WhyAndCta";

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
