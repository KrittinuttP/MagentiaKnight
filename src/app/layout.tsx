import type { Metadata } from "next";
import { Charm, Cinzel, Noto_Sans_Thai, Trirong } from "next/font/google";

import { MediaProtection } from "@/components/media/MediaProtection";

import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const trirong = Trirong({
  variable: "--font-trirong",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

const charm = Charm({
  variable: "--font-charm",
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Roselia HBD 2026 — ขอถวายพรแด่องค์หญิง",
  description:
    "ขอถวายพรแด่ Roselia de Magentia Ch. Pixela S ในวันประสูติ — รวมการ์ดถวายพรจากเซไนท์ 09.10.2026 โดยแฟนคลับ MagentiaKnight",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`dark ${notoSansThai.variable} ${cinzel.variable} ${trirong.variable} ${charm.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black font-sans text-base leading-relaxed text-[#fff5f7]">
        <MediaProtection />
        {children}
      </body>
    </html>
  );
}
