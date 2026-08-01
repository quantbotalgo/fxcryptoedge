import { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "rounded-[20px] border border-white/[.08] bg-gradient-to-b from-white/[.05] to-white/[.02] " +
        className
      }
      {...rest}
    />
  );
}

export function FlatCard({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={"rounded-[20px] border border-white/[.08] bg-white/[.03] " + className}
      {...rest}
    />
  );
}
