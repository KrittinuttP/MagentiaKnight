import Link from "next/link";
import { Crown, Lock, Sparkles } from "lucide-react";

export function SimpleHbdHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#e8b4bd]/15 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#fff5f7] transition hover:opacity-85"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-[#c23a55]/20 text-[#c23a55]">
            <Crown className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-wide sm:text-base">
            MagentiaKnight <span className="text-[#c23a55]">HBD 2026</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl px-3 py-1.5 text-xs font-medium text-[#e8b4bd]/80 transition hover:bg-white/5 hover:text-[#fff5f7]"
          >
            คำอวยพร
          </Link>
          <Link
            href="/upload"
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#c23a55] px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_0_15px_rgba(194,58,85,0.35)] transition hover:bg-[#d9506b]"
          >
            <Sparkles className="size-3.5" />
            <span>ส่งการ์ด</span>
          </Link>
          <Link
            href="/admin"
            title="Admin"
            aria-label="Admin"
            className="flex size-8 items-center justify-center rounded-xl text-[#e8b4bd]/40 transition hover:bg-white/5 hover:text-[#e8b4bd]"
          >
            <Lock className="size-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
