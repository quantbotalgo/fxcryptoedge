import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Fx Crypto Edge — Trading signals for Forex, Crypto & Gold";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at request time — no static image asset needed. Kept simple
// (no external fonts/images) since edge ImageResponse can't fetch local
// project files, only remote URLs or inline data.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08070e",
          backgroundImage:
            "radial-gradient(1200px 620px at 50% -220px, rgba(99,102,241,.5), transparent 60%), radial-gradient(760px 520px at 88% 260px, rgba(139,124,246,.3), transparent 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "linear-gradient(135deg, #8b7cf6, #6366f1)",
              fontSize: 40,
            }}
          >
            ⚡
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#ffffff" }}>
            Fx Crypto Edge
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: "rgba(244,243,250,.75)",
          }}
        >
          Trading signals for Forex, Crypto &amp; Gold
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontSize: 22,
            color: "#a99bf9",
            letterSpacing: 2,
          }}
        >
          BUILT FOR INDIA
        </div>
      </div>
    ),
    { ...size }
  );
}
