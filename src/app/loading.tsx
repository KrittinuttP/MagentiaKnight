export default function Hbd2026Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center bg-[#000000] px-6 text-[#fff5f7]">
      <div
        className="size-10 animate-pulse rounded-full bg-[#c23a55]/35 ring-2 ring-[#c23a55]/25"
        aria-hidden
      />
      <p className="mt-5 text-xs tracking-[0.22em] text-[#e8b4bd]/80 uppercase sm:text-sm">
        Birthday · 2026
      </p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-normal tracking-normal sm:text-2xl">
        กำลังโหลดคำอวยพร…
      </p>
      <p className="mt-2 max-w-xs text-center text-sm text-[#e8b4bd]/65">
        ดึงข้อมูลล่าสุดจากเซไนท์
      </p>
    </div>
  );
}
