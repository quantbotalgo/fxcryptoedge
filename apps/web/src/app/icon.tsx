import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Same mark as the nav logo (rounded gradient square + ⚡), generated on the
// fly so there's no separate binary asset to keep in sync with the design.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          background: "linear-gradient(135deg, #8b7cf6, #6366f1)",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: "#ffffff" }}>⚡</span>
      </div>
    ),
    { ...size }
  );
}
