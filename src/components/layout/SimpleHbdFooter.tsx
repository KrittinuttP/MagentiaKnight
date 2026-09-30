import Link from "next/link";

const DEVELOPER = {
  name: "ZAYZHIK 🦈",
  xUrl: "https://x.com/ZAYZHIK_KungV2",
} as const;

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function SimpleHbdFooter() {
  return (
    <footer className="border-t border-[#e8b4bd]/10 bg-black py-8 text-center text-xs text-[#e8b4bd]/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4">
        <p className="text-[#e8b4bd]/75">
          For Roselia de Magentia Ch. Pixela S · by MagentiaKnight
        </p>
        <p className="text-[0.7rem] text-[#e8b4bd]/45">
          09.10.2026 · Pixela Project Fan Project
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-[#e8b4bd]/60">
          <span>Made by</span>
          <Link
            href={DEVELOPER.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 transition hover:text-[#c23a55]"
          >
            <span>{DEVELOPER.name}</span>
            <XLogo className="size-[0.85em] shrink-0 opacity-80 transition group-hover:opacity-100" />
            <span className="sr-only">on X</span>
          </Link>
        </p>
      </div>
    </footer>
  );
}
