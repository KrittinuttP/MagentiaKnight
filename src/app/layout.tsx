import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Noto_Sans_Thai } from "next/font/google";

import { MediaProtection } from "@/components/media/MediaProtection";

import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-display",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Roselia HBD 2026 — รวมคำอวยพรจากเซไนท์",
  description:
    "สุขสันต์วันเกิด Roselia de Magentia Ch. Pixela S — รวมการ์ดอวยพรจากเซไนท์ 09.10.2026 โดยแฟนคลับ MagentiaKnight",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`dark ${notoSansThai.variable} ${ibmPlexSansThai.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black font-sans text-base leading-relaxed text-[#fff5f7]">
        <MediaProtection />
        {children}
      </body>
    </html>
  );
}
