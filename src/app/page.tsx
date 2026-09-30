import { HbdScroll } from "@/components/hbd/HbdScroll";
import { SimpleHbdFooter } from "@/components/layout/SimpleHbdFooter";
import { SimpleHbdHeader } from "@/components/layout/SimpleHbdHeader";
import hbdContent from "@/data/hbd.json";
import { loadApprovedHbdWishes } from "@/lib/hbd-submissions-store";
import type { HbdPage } from "@/types/hbd";

/** Always fetch approved wishes fresh — avoid stale ISR after admin approve */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const approved = await loadApprovedHbdWishes();
  const hbd: HbdPage = { ...hbdContent, wishes: approved };

  return (
    <>
      <SimpleHbdHeader />
      <main className="flex-1 bg-black">
        <HbdScroll hbd={hbd} />
      </main>
      <SimpleHbdFooter />
    </>
  );
}
