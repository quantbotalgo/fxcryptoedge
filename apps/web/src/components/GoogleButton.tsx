"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: unknown) => void;
          renderButton: (parent: HTMLElement, options: unknown) => void;
        };
      };
    };
  }
}

export function GoogleButton({ onDone }: { onDone?: () => void }) {
  const { loginWithGoogleIdToken } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    function init() {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: { credential: string }) => {
          setError(null);
          try {
            await loginWithGoogleIdToken(resp.credential);
            onDone?.();
          } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Google sign-in failed");
          }
        },
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: "filled_black",
        size: "large",
        width: 320,
        shape: "pill",
      });
    }
    const id = setInterval(() => {
      if (window.google) {
        init();
        clearInterval(id);
      }
    }, 200);
    return () => clearInterval(id);
  }, [clientId, loginWithGoogleIdToken, onDone]);

  if (!clientId) {
    return (
      <div className="rounded-[12px] border border-white/[.1] bg-white/[.03] px-4 py-3 text-center text-xs text-fg/45">
        Google login isn&apos;t configured yet. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to apps/web/.env.local.
      </div>
    );
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div ref={ref} className="flex justify-center" />
      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </>
  );
}
