"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const MARKETING_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Live Signals", href: "/signals" },
  { label: "Performance", href: "/performance" },
  { label: "Pricing", href: "/pricing" },
  { label: "Refer & Earn", href: "/refer" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(() => {
    if (!user) return [...MARKETING_ITEMS];

    // Once logged in, Dashboard replaces Home as the landing point — the logo
    // still links back to "/" if someone wants the marketing page. Admins are
    // operating the platform, not buying a plan or acting as an affiliate, so
    // Pricing and Refer & Earn drop out of their nav too.
    const hiddenForUser = user.role === "ADMIN" ? ["/", "/pricing", "/refer"] : ["/"];
    const items = MARKETING_ITEMS.filter((item) => !hiddenForUser.includes(item.href));

    if (user.role === "ADMIN") {
      // Dashboard leads for admins — it's their actual home base, not an
      // afterthought after the marketing-facing tabs.
      items.unshift({ label: "Dashboard", href: "/dashboard" });
      items.push({ label: "Admin", href: "/admin" });
    } else {
      items.push({ label: "Dashboard", href: "/dashboard" });
    }
    return items;
  }, [user]);

  const anyMenuOpen = menuOpen || mobileOpen;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[.07] bg-bg/72 backdrop-blur-2xl">
    {/* Click/tap anywhere outside an open dropdown to close it — sits below
        the nav bar's own z-index so it doesn't block the dropdown itself. */}
    {anyMenuOpen && (
      <div
        className="fixed inset-0 z-40"
        onClick={() => {
          setMenuOpen(false);
          setMobileOpen(false);
        }}
      />
    )}
    <div className="relative flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-gradient-to-br from-accent to-accent-2 shadow-[0_6px_18px_rgba(99,102,241,.4)]">
          <span className="font-display text-lg font-bold text-white">⚡</span>
        </div>
        <span className="font-display text-[19px] font-bold tracking-tight">
          Fx Crypto Edge<span className="text-accent">.</span>
        </span>
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[14.5px] font-medium transition-colors ${
                active ? "text-fg" : "text-fg/55 hover:text-fg/80"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 text-[14px] font-medium text-fg/85"
            >
              {user.name.split(" ")[0]}
              {user.role === "ADMIN" && user.name.trim().toLowerCase() !== "admin" && (
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] text-accent-soft">
                  Admin
                </span>
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-[14px] border border-white/[.1] bg-[#0d0b16] p-1.5 shadow-xl">
                <div className="px-3 py-2 text-xs text-fg/45 truncate">{user.email}</div>
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await logout();
                    router.push("/");
                  }}
                  className="block w-full rounded-[10px] px-3 py-2 text-left text-sm text-fg/85 hover:bg-white/[.05]"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login" className="hidden text-[14px] font-medium text-fg/65 sm:block">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-[12px] bg-gradient-to-br from-accent to-accent-2 px-[18px] py-2 text-[14px] font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,.32)]"
            >
              Start free
            </Link>
          </>
        )}

        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-white/[.1] text-fg/80 md:hidden"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b border-white/[.07] bg-[#0d0b16] px-5 py-3 shadow-xl md:hidden">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-[10px] px-3 py-2.5 text-[15px] font-medium ${
                  active ? "bg-white/[.06] text-fg" : "text-fg/65"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {!user && (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-[10px] px-3 py-2.5 text-[15px] font-medium text-fg/65 sm:hidden"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </div>
    </nav>
  );
}
