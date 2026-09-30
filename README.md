# MagentiaKnight — Roselia HBD 2026

เว็บรวมการ์ดอวยพรวันเกิด **Roselia de Magentia Ch. Pixela S** (09.10.2026) โดยแฟนคลับ **MagentiaKnight** — Pixela Project Fan Project

| หน้า | หน้าที่ |
|---|---|
| `/` | รวมการ์ดอวยพรที่อนุมัติแล้ว (scrollytelling ด้วย GSAP ScrollTrigger) |
| `/upload` | เซไนท์ส่งการ์ด พร้อม live preview |
| `/admin` | ปลดล็อกด้วยรหัสทีม แล้วอนุมัติ / ปฏิเสธการ์ด |

Stack: Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · GSAP + `@gsap/react` · shadcn/ui (Base UI) · lucide-react · Supabase

## Setup

1. ติดตั้ง dependencies

   ```bash
   npm install
   ```

2. สร้าง `.env.local` จาก `.env.example` แล้วใส่ค่า Supabase และ `SITE_ADMIN_PASSWORD`
   (ถ้าไม่ตั้ง `SITE_ADMIN_PASSWORD` หน้า `/admin` จะปลดล็อกไม่ได้)

3. รัน SQL ใน `supabase/migrations/20260930000000_magentia_knight_hbd.sql` ผ่าน Supabase SQL Editor
   - สร้าง schema `magentia_knight` + ตาราง `hbd_submissions`
   - สร้าง bucket `magentia-hbd-uploads`
   - สร้าง view `public.magentia_knight_hbd_wishes_public` (สาธารณะ, ไม่มีข้อมูลติดต่อ)
     และ `public.magentia_knight_hbd_submissions` (service role เท่านั้น)
   - ไม่ต้องเพิ่ม schema ใหม่ใน Exposed schemas เพราะแอปอ่านผ่าน view ใน `public`

4. รัน dev server

   ```bash
   npm run dev
   ```

## Assets

- เทมเพลตการ์ด: `public/assets/hbd/template/hbd-card-template.png`
- รูปโปรไฟล์เริ่มต้น: `public/assets/hbd/default-avatar.jpg`

(ตอนนี้ยังเป็นไฟล์ตัวแทน — แทนที่ด้วยไฟล์ชื่อเดิมได้เลย)

## Palette

ดำ `#000000` → `#430a17` → `#570d1e` · accent `#c23a55` (hover `#d9506b`) · ตัวอักษรอ่อน `#e8b4bd`

---

Made by [ZAYZHIK 🦈](https://x.com/ZAYZHIK_KungV2)
