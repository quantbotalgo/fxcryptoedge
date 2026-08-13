export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 border-t border-white/[.07] px-5 sm:px-8 py-7">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-gradient-to-br from-accent to-accent-2 text-[15px]">
          ⚡
        </div>
        <span className="font-display text-base font-bold">
          Fx Crypto Edge<span className="text-accent">.</span>
        </span>
      </div>
      <div className="flex gap-7 text-sm text-fg/60">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="mailto:partners@fxcryptoedge.in">Contact</a>
      </div>
    </footer>
  );
}
