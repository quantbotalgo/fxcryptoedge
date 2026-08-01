import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fx Crypto Edge — Trading signals for Forex, Crypto & Gold",
  description:
    "Get real-time BUY/SELL alerts with precise entries, stop loss and multiple take-profits — for XAU/USD, major forex pairs, and top crypto. Priced in ₹ for Indian traders.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg antialiased">
        <AuthProvider>
          <div
            className="min-h-screen flex-1 flex flex-col"
            style={{
              background:
                "radial-gradient(1200px 620px at 50% -220px, rgba(99,102,241,.28), transparent 60%), radial-gradient(760px 520px at 88% 260px, rgba(139,124,246,.14), transparent 55%), #08070e",
            }}
          >
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
