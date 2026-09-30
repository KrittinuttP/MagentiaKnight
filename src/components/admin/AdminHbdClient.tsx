"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Cake,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  RotateCcw,
  Trash2,
  Unlock,
  XCircle,
} from "lucide-react";

import { BackLink } from "@/components/layout/BackLink";
import { buttonVariants } from "@/components/ui/button";
import type {
  HbdSubmissionAction,
  HbdSubmissionRow,
} from "@/lib/hbd-submissions-store";
import { HBD_AVATAR_DEFAULT } from "@/lib/hbd-upload";
import {
  CTA_OUTLINE_CLASS,
  CTA_PRIMARY_CLASS,
  META_CLASS,
  META_MUTED_CLASS,
} from "@/lib/site-ui";
import { cn } from "@/lib/utils";

const DISPLAY = "font-[family-name:var(--font-display)]";

type Tab = "pending" | "approved" | "rejected";

const TABS: { id: Tab; label: string; empty: string }[] = [
  {
    id: "pending",
    label: "รออนุมัติ (Pending)",
    empty: "รอเซไนท์ส่งการ์ดคำอวยพรจากหน้า /upload",
  },
  {
    id: "approved",
    label: "อนุมัติแล้ว (Approved)",
    empty: "ยังไม่มีรายการที่ได้รับการอนุมัติ",
  },
  {
    id: "rejected",
    label: "ลบแล้ว (Removed)",
    empty: "ไม่มีรายการที่ถูกปฏิเสธหรือลบ",
  },
];

const ACTION_BUTTON_CLASS =
  "inline-flex items-center gap-1.5 rounded-xl px-3.5 text-xs transition";
const APPROVE_BUTTON_CLASS =
  "border border-emerald-500/50 bg-emerald-500/20 font-semibold text-emerald-200 shadow-sm hover:bg-emerald-500/30 hover:text-white";
const NEUTRAL_BUTTON_CLASS =
  "border-[#e8b4bd]/30 bg-[#1a0409]/60 text-[#f7d7de] hover:bg-[#e8b4bd]/10 hover:text-white";
const DANGER_BUTTON_CLASS =
  "border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-white";

export function AdminHbdClient() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<HbdSubmissionRow[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const load = useCallback(async (status: Tab) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/hbd/admin/submissions?status=${status}`
      );
      const data = (await res.json()) as {
        submissions?: HbdSubmissionRow[];
        pendingCount?: number;
        error?: string;
      };
      if (!res.ok) {
        if (res.status === 401) {
          setUnlocked(false);
          return;
        }
        setError(data.error ?? "โหลดไม่สำเร็จ");
        return;
      }
      setItems(data.submissions ?? []);
      setPendingCount(data.pendingCount ?? 0);
    } catch {
      setError("เครือข่ายมีปัญหา");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/unlock");
        const data = (await res.json()) as { unlocked?: boolean };
        if (cancelled) return;
        const ok = Boolean(data.unlocked);
        setUnlocked(ok);
        if (ok) await load("pending");
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setUnlockError(null);
    const res = await fetch("/api/admin/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setUnlockError(data?.error ?? "ปลดล็อกไม่สำเร็จ");
      return;
    }
    setPassword("");
    setUnlocked(true);
    setTab("pending");
    await load("pending");
  }

  async function lock() {
    await fetch("/api/admin/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "lock" }),
    });
    setUnlocked(false);
    setItems([]);
    setPendingCount(0);
  }

  async function switchTab(next: Tab) {
    setTab(next);
    await load(next);
  }

  async function act(id: string, action: HbdSubmissionAction | "delete") {
    if (
      action === "delete" &&
      !window.confirm("ลบถาวร? การ์ดและรูปจะถูกลบออกจากระบบ กู้คืนไม่ได้")
    ) {
      return;
    }

    setActingId(id);
    setError(null);
    try {
      const res = await fetch(
        `/api/hbd/admin/submissions/${id}`,
        action === "delete"
          ? { method: "DELETE" }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action }),
            }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "อัปเดตไม่สำเร็จ");
        return;
      }
      await load(tab);
    } catch {
      setError("เครือข่ายมีปัญหา");
    } finally {
      setActingId(null);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <span className="size-3 rounded-full bg-[#c23a55] animate-ping" />
        <p className="text-sm font-medium tracking-[0.2em] text-[#e8b4bd]/70 uppercase">
          Checking clearance…
        </p>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md pt-8">
        <form
          onSubmit={unlock}
          className="relative overflow-hidden rounded-3xl border border-[#e8b4bd]/15 bg-gradient-to-b from-[#570d1e]/95 via-[#430a17]/90 to-[#000000] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] sm:p-9"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#c23a55]/40 bg-[#c23a55]/15 text-[#c23a55] shadow-[0_0_16px_rgba(194,58,85,0.3)]">
              <Lock className="size-6" />
            </div>
            <div>
              <p className={META_MUTED_CLASS}>Site Admin</p>
              <h1 className={cn(DISPLAY, "text-2xl font-normal text-[#fff5f7]")}>
                HBD Approvals
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[#f7d7de]/80">
            ใส่รหัสทีมเพื่อตรวจและอนุมัติการ์ดอวยพร
          </p>

          <label className="mt-6 block">
            <span className={META_CLASS}>Clearance code</span>
            <div className="relative mt-2 flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="ป้อนรหัสผ่านทีม…"
                className="w-full rounded-2xl border border-[#e8b4bd]/20 bg-[#1a0409]/90 px-4 py-3 text-sm text-[#fff5f7] placeholder-[#e8b4bd]/30 outline-none transition focus:border-[#c23a55]/70 focus:ring-2 focus:ring-[#c23a55]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 p-1.5 text-[#e8b4bd]/60 transition hover:text-[#fff5f7]"
                aria-label={showPassword ? "ซ่อนรหัส" : "แสดงรหัส"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </label>

          {unlockError ? (
            <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs text-red-200">
              <span className="size-1.5 rounded-full bg-red-400" />
              {unlockError}
            </div>
          ) : null}

          <button
            type="submit"
            className={cn(
              buttonVariants({ size: "lg" }),
              CTA_PRIMARY_CLASS,
              "mt-6 flex w-full items-center justify-center gap-2 font-semibold"
            )}
          >
            <Unlock className="size-4" />
            ปลดล็อกเข้าสู่ระบบ
          </button>

          <div className="mt-5 border-t border-[#e8b4bd]/10 pt-4 text-center">
            <BackLink href="/">กลับหน้าคำอวยพร</BackLink>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* 🌟 Header */}
      <div className="border-b border-[#e8b4bd]/12 pb-6">
        <BackLink href="/" className="mb-4">
          หน้าคำอวยพร
        </BackLink>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Cake className="size-4 text-[#c23a55]" />
              <p className={META_CLASS}>Birthday · 09.10.2026</p>
            </div>
            <h1 className={cn(DISPLAY, "mt-1.5 text-3xl font-normal text-[#fff5f7] sm:text-4xl")}>
              HBD Submissions
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/upload"
              target="_blank"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                CTA_OUTLINE_CLASS,
                "inline-flex items-center gap-1.5 text-xs"
              )}
            >
              <span>ดูหน้าอัปโหลด</span>
              <ExternalLink className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={lock}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                CTA_OUTLINE_CLASS,
                "inline-flex items-center gap-1.5 text-xs"
              )}
            >
              <Lock className="size-3.5" />
              ล็อกเซสชัน
            </button>
          </div>
        </div>
      </div>

      {/* 🏷️ Segmented Pill Tabs */}
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#e8b4bd]/15 bg-[#1a0409]/80 p-1.5 shadow-inner">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => switchTab(id)}
            className={cn(
              "flex-1 rounded-xl px-2 py-2 text-xs font-semibold tracking-wide transition sm:px-4 sm:text-sm",
              tab === id
                ? "border border-[#c23a55]/60 bg-[#c23a55]/25 text-[#fff5f7] shadow-[0_0_16px_rgba(194,58,85,0.3)]"
                : "text-[#e8b4bd]/65 hover:text-[#fff5f7]"
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              <span>{label}</span>
              {id === "pending" && pendingCount > 0 ? (
                <span className="rounded-full bg-[#c23a55] px-2 py-0.2 text-[0.68rem] font-bold text-white shadow-sm">
                  {pendingCount}
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-200">
          <span className="size-1.5 rounded-full bg-red-400" />
          {error}
        </div>
      ) : null}

      {/* 📋 Submissions List */}
      {loading ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3">
          <span className="size-2.5 rounded-full bg-[#c23a55] animate-ping" />
          <p className="text-xs tracking-widest text-[#e8b4bd]/60 uppercase">
            กำลังโหลดข้อมูล…
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[#e8b4bd]/20 bg-[#430a17]/40 px-6 py-16 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-[#e8b4bd]/15 bg-[#1a0409] text-[#e8b4bd]/50">
            <Cake className="size-6" />
          </div>
          <p className={cn(DISPLAY, "mt-4 text-lg font-normal text-[#fff5f7]")}>
            ยังไม่มีรายการในสถานะนี้
          </p>
          <p className="mt-1.5 text-xs text-[#e8b4bd]/65">
            {TABS.find((t) => t.id === tab)?.empty}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="group overflow-hidden rounded-3xl border border-[#e8b4bd]/15 bg-gradient-to-b from-[#570d1e]/85 via-[#430a17]/80 to-[#1a0409]/90 p-5 shadow-lg transition hover:border-[#c23a55]/40"
            >
              <div className="flex flex-col gap-5 sm:flex-row">
                {/* 🖼️ Card Preview */}
                <div className="relative shrink-0 overflow-hidden rounded-2xl border border-[#e8b4bd]/15 bg-[#1a0409] sm:w-44">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.card_url}
                    alt=""
                    className="h-auto w-full object-contain transition duration-500 group-hover:scale-105"
                  />
                </div>

                {/* 📝 Content & User Info */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    {/* User Profile Bar */}
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.avatar_url || HBD_AVATAR_DEFAULT}
                        alt=""
                        className="size-11 rounded-full border border-[#c23a55]/40 object-cover shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className={cn(DISPLAY, "truncate text-base font-normal text-[#fff5f7]")}>
                          {item.display_name}
                        </p>
                        <p className="text-xs text-[#c23a55]">
                          {item.contact_channel === "x" ? "X (Twitter)" : "Discord"} ·{" "}
                          <span className="font-mono text-[#e8b4bd]/80">{item.contact_handle}</span>
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mt-3.5 rounded-2xl border border-[#e8b4bd]/10 bg-[#1a0409]/80 p-3.5">
                      {item.message ? (
                        <p className="text-xs leading-relaxed text-[#f7d7de]/90 sm:text-sm">
                          {item.message}
                        </p>
                      ) : (
                        <p className="text-xs italic text-[#e8b4bd]/45">
                          (ไม่มีข้อความคำอวยพรเพิ่มเติม)
                        </p>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-[0.68rem] text-[#e8b4bd]/50">
                      <Clock className="size-3 text-[#c23a55]" />
                      <span>{new Date(item.created_at).toLocaleString("th-TH")}</span>
                    </div>
                  </div>

                  {/* 🔘 Action Buttons */}
                  <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-[#e8b4bd]/10 pt-3.5">
                    {tab === "pending" ? (
                      <>
                        <button
                          type="button"
                          disabled={actingId === item.id}
                          onClick={() => act(item.id, "approve")}
                          className={cn(
                            buttonVariants({ size: "sm" }),
                            ACTION_BUTTON_CLASS,
                            APPROVE_BUTTON_CLASS
                          )}
                        >
                          <CheckCircle2 className="size-3.5" />
                          อนุมัติ (Approve)
                        </button>
                        <button
                          type="button"
                          disabled={actingId === item.id}
                          onClick={() => act(item.id, "reject")}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            ACTION_BUTTON_CLASS,
                            DANGER_BUTTON_CLASS
                          )}
                        >
                          <XCircle className="size-3.5" />
                          ปฏิเสธ (Reject)
                        </button>
                      </>
                    ) : tab === "approved" ? (
                      <>
                        <button
                          type="button"
                          disabled={actingId === item.id}
                          onClick={() => act(item.id, "hide")}
                          title="เอาออกจากหน้าเว็บ แล้วย้ายกลับไปรออนุมัติ"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            ACTION_BUTTON_CLASS,
                            NEUTRAL_BUTTON_CLASS
                          )}
                        >
                          <EyeOff className="size-3.5" />
                          ซ่อน (Hide)
                        </button>
                        <button
                          type="button"
                          disabled={actingId === item.id}
                          onClick={() => act(item.id, "remove")}
                          title="เอาออกจากหน้าเว็บ แล้วย้ายไปแท็บลบแล้ว"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            ACTION_BUTTON_CLASS,
                            DANGER_BUTTON_CLASS
                          )}
                        >
                          <Trash2 className="size-3.5" />
                          ลบ (Remove)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={actingId === item.id}
                          onClick={() => act(item.id, "restore")}
                          title="ย้ายกลับไปรออนุมัติ"
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            ACTION_BUTTON_CLASS,
                            NEUTRAL_BUTTON_CLASS
                          )}
                        >
                          <RotateCcw className="size-3.5" />
                          กู้คืน (Restore)
                        </button>
                        <button
                          type="button"
                          disabled={actingId === item.id}
                          onClick={() => act(item.id, "delete")}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            ACTION_BUTTON_CLASS,
                            DANGER_BUTTON_CLASS
                          )}
                        >
                          <Trash2 className="size-3.5" />
                          ลบถาวร (Delete)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
