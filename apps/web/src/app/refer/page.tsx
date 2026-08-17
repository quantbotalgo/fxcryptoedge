import type { Metadata } from "next";
import { API_URL } from "@/lib/api";
import type { CommissionTier } from "@/lib/types";
import { ReferClient } from "./ReferClient";
import { WhyAndCta } from "@/components/WhyAndCta";

export const metadata: Metadata = {
  title: "Refer & Earn",
  description:
    "Share your referral link and earn commission on every paid subscription. Tiered payouts for influencers and affiliates.",
  alternates: { canonical: "/refer" },
};

async function getTiers(): Promise<CommissionTier[]> {
  try {
    const res = await fetch(`${API_URL}/api/referrals/tiers`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tiers as CommissionTier[];
  } catch {
    return [];
  }
}

export default async function ReferPage() {
  const tiers = await getTiers();
  return (
    <>
      <ReferClient tiers={tiers} />
      <WhyAndCta />
    </>
  );
}
