import type { Metadata } from "next";
import { PerformanceClient } from "./PerformanceClient";
import { WhyAndCta } from "@/components/WhyAndCta";

export const metadata: Metadata = {
  title: "Performance",
  description:
    "Transparent, verified track record of every closed forex, crypto, and gold signal — win rate, cumulative return, and full trade history.",
  alternates: { canonical: "/performance" },
};

// Fetched client-side in PerformanceClient rather than here — same reason as
// the Signals page: the frontend (Vercel) and API (Render) are on different
// domains, so a server-side fetch here would never carry the visitor's auth
// cookie and would always look logged-out to the API, even for a real
// subscriber. A client-side fetch talks to the API's own domain directly, so
// the cookie attaches correctly and entitlements resolve for the real viewer.
export default function PerformancePage() {
  return (
    <>
      <PerformanceClient />
      <WhyAndCta />
    </>
  );
}
