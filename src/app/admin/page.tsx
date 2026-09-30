import type { Metadata } from "next";

import { AdminHbdClient } from "@/components/admin/AdminHbdClient";
import { SimpleHbdFooter } from "@/components/layout/SimpleHbdFooter";
import { SimpleHbdHeader } from "@/components/layout/SimpleHbdHeader";

export const metadata: Metadata = {
  title: "Admin · HBD submissions",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return (
    <>
      <SimpleHbdHeader />
      <main className="relative flex-1 bg-black px-4 pb-14 pt-24 text-[#fff5f7] sm:px-8 sm:pt-28">
        <div className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 bg-[radial-gradient(circle,rgba(194,58,85,0.14),transparent_70%)]" />
        <AdminHbdClient />
      </main>
      <SimpleHbdFooter />
    </>
  );
}
