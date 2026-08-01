import { HTMLAttributes } from "react";
import type { SignalStatus } from "@/lib/types";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs tracking-[.22em] text-accent uppercase">{children}</div>
  );
}

export function Pill({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "inline-flex items-center gap-2 rounded-full border border-white/[.12] bg-white/[.04] px-4 py-1.5 text-[13px] text-fg/75 " +
        className
      }
      {...rest}
    >
      {children}
    </div>
  );
}

const STATUS_STYLES: Record<SignalStatus, { bg: string; color: string; label: string }> = {
  ACTIVE: { bg: "rgba(139,124,246,.18)", color: "#a99bf9", label: "Active" },
  TP_HIT: { bg: "rgba(52,211,153,.16)", color: "#34d399", label: "TP Hit" },
  SL_HIT: { bg: "rgba(255,255,255,.07)", color: "rgba(244,243,250,.55)", label: "SL Hit" },
  CLOSED: { bg: "rgba(255,255,255,.07)", color: "rgba(244,243,250,.55)", label: "Closed" },
};

export function StatusBadge({ status }: { status: SignalStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

export function statusLabel(status: SignalStatus) {
  return STATUS_STYLES[status].label;
}
