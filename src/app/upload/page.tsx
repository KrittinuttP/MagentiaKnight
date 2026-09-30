import type { Metadata } from "next";

import { HbdUploadClient } from "@/components/hbd/HbdUploadClient";
import { SimpleHbdFooter } from "@/components/layout/SimpleHbdFooter";
import { SimpleHbdHeader } from "@/components/layout/SimpleHbdHeader";

export const metadata: Metadata = {
  title: "ส่งการ์ดอวยพร | Roselia HBD 2026",
  description:
    "อัปโหลดการ์ดอวยพรวันเกิด Roselia de Magentia · 09.10.2026 — จากเซไนท์ถึงองค์หญิงของเรา",
};

export default function UploadPage() {
  return (
    <>
      <SimpleHbdHeader />
      <main className="flex-1 bg-[linear-gradient(180deg,#000000_0%,#1a0409_55%,#430a17_100%)] text-[#f7d7de]">
        <HbdUploadClient />
      </main>
      <SimpleHbdFooter />
    </>
  );
}
