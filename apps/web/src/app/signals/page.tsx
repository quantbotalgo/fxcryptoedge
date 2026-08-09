import { SignalsClient } from "./SignalsClient";
import { WhyAndCta } from "@/components/WhyAndCta";

// Signals are fetched client-side inside SignalsClient rather than here on
// the server. Reason: the frontend (Vercel) and API (Render) are on
// different domains in production, so the browser's auth cookie is scoped to
// the API's domain and is never sent to the Next.js server when it renders
// this page — a server-side fetch would always look "logged out" to the API,
// even for a real admin/subscriber. A client-side fetch (via `api.get`, with
// credentials: "include") talks to the API's domain directly, so the browser
// attaches the cookie correctly and entitlements resolve for the real viewer.
export default function SignalsPage() {
  return (
    <>
      <SignalsClient />
      <WhyAndCta />
    </>
  );
}
