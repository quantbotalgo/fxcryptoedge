import Link from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

const gradient =
  "bg-gradient-to-br from-accent to-accent-2 text-white shadow-[0_12px_30px_rgba(99,102,241,.32)]";

type GradientButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type GradientLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function GradientButton({ className = "", children, ...rest }: GradientButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15.5px] font-semibold cursor-pointer transition-transform active:scale-[.98] ${gradient} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GradientLink({ className = "", children, href, ...rest }: GradientLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-[14px] px-6 py-3.5 text-[15.5px] font-semibold cursor-pointer transition-transform active:scale-[.98] ${gradient} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function OutlineLink({ className = "", children, href, ...rest }: GradientLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-[14px] border border-white/[.16] bg-white/[.03] px-6 py-3.5 text-[15.5px] font-semibold text-fg cursor-pointer ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
