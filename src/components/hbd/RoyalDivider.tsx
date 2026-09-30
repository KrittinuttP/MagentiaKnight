import type { ComponentPropsWithoutRef } from "react";
import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";

/** Gold line · crown · gold line */
export function RoyalDivider({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      aria-hidden
      className={cn("flex items-center justify-center gap-3 text-gold", className)}
      {...props}
    >
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/70 sm:w-24" />
      <Crown className="size-4 sm:size-5" strokeWidth={1.5} />
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/70 sm:w-24" />
    </div>
  );
}
