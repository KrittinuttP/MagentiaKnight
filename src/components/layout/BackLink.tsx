import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type BackLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Shared glass-pill back nav — left-aligned site-wide. */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex self-start items-center gap-2 rounded-full border border-[#e8b4bd]/20 bg-white/[0.06] px-3.5 py-2 text-sm text-[#e8b4bd]/90 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm transition hover:border-[#c23a55]/40 hover:bg-[#c23a55]/15 hover:text-[#fff5f7]",
        className
      )}
    >
      <ArrowLeft className="size-4 shrink-0" />
      {children}
    </Link>
  );
}
