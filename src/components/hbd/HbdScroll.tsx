"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Loader2,
  Sparkles,
} from "lucide-react";

import { RoyalDivider } from "@/components/hbd/RoyalDivider";
import { ProtectedImage } from "@/components/media/ProtectedImage";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HBD_AVATAR_DEFAULT, hbdCardDownloadName } from "@/lib/hbd-upload";
import { downloadImageAsJpeg } from "@/lib/image-download";
import { CTA_PRIMARY_CLASS } from "@/lib/site-ui";
import {
  gsap,
  registerGsapPlugins,
  ScrollTrigger,
  useGSAP,
} from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { HbdPage } from "@/types/hbd";

registerGsapPlugins();

const DISPLAY = "font-[family-name:var(--font-display)]";

/** Cards above the fold load immediately; the rest load as they scroll near. */
const EAGER_CARD_COUNT = 2;

type HbdScrollProps = {
  hbd: HbdPage;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HbdScroll({ hbd }: HbdScrollProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const wishes = useMemo(() => hbd.wishes, [hbd.wishes]);

  const lightboxItems = useMemo(
    () =>
      wishes
        .filter((wish) => Boolean(wish.image))
        .map((wish) => ({
          id: wish.id,
          src: wish.image as string,
          alt: wish.alt ?? `Wish from ${wish.from}`,
          from: wish.from,
        })),
    [wishes]
  );

  const activeLightbox =
    lightboxIndex !== null ? (lightboxItems[lightboxIndex] ?? null) : null;

  const openLightbox = (wishId: string) => {
    const index = lightboxItems.findIndex((item) => item.id === wishId);
    if (index >= 0) setLightboxIndex(index);
  };

  const downloadActive = async () => {
    if (!activeLightbox || downloading) return;
    setDownloading(true);
    try {
      await downloadImageAsJpeg(
        activeLightbox.src,
        hbdCardDownloadName(activeLightbox.from)
      );
    } catch {
      window.open(activeLightbox.src, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  };

  const goPrev = () => {
    if (lightboxItems.length < 2 || lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length
    );
  };

  const goNext = () => {
    if (lightboxItems.length < 2 || lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % lightboxItems.length);
  };

  useEffect(() => {
    if (lightboxIndex === null || lightboxItems.length < 2) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setLightboxIndex(
          (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length
        );
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setLightboxIndex((lightboxIndex + 1) % lightboxItems.length);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, lightboxItems.length]);

  // Lazy images change card heights after load; trigger positions must follow.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onLoad = (event: Event) => {
      if (!(event.target instanceof HTMLImageElement)) return;
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 150);
    };

    root.addEventListener("load", onLoad, true);
    return () => {
      clearTimeout(timer);
      root.removeEventListener("load", onLoad, true);
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      if (prefersReducedMotion()) {
        gsap.set(root.querySelectorAll("[data-hbd-anim]"), {
          clearProps: "all",
          autoAlpha: 1,
          y: 0,
          x: 0,
          scale: 1,
        });
        return;
      }

      const introBits = root.querySelectorAll<HTMLElement>(
        "[data-hbd-intro] [data-hbd-anim]"
      );
      if (introBits.length) {
        gsap.fromTo(
          introBits,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.08,
          }
        );
      }

      const cards = gsap.utils.toArray<HTMLElement>("[data-hbd-card]", root);
      cards.forEach((card) => {
        const media = card.querySelector<HTMLElement>("[data-hbd-media]");
        const mediaInner = card.querySelector<HTMLElement>(
          "[data-hbd-media-inner]"
        );
        const copy = card.querySelector<HTMLElement>("[data-hbd-copy]");

        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 56 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );

        if (media) {
          gsap.fromTo(
            media,
            { scale: 0.97 },
            {
              scale: 1,
              duration: 1.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        if (mediaInner) {
          gsap.fromTo(
            mediaInner,
            { yPercent: 3 },
            {
              yPercent: -3,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.65,
              },
            }
          );
        }

        if (copy) {
          gsap.set(copy.children, { autoAlpha: 0, y: 16 });
          gsap.to(copy.children, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });

      const closer = root.querySelector<HTMLElement>("[data-hbd-close]");
      if (closer) {
        const bits = closer.querySelectorAll<HTMLElement>("[data-hbd-anim]");
        const headline = closer.querySelector<HTMLElement>(
          "[data-hbd-close-headline]"
        );

        gsap.set(bits, { autoAlpha: 0, y: 24 });
        if (headline) gsap.set(headline, { scale: 0.94 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: closer,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        bits.forEach((bit, index) => {
          const isHeadline = bit.hasAttribute("data-hbd-close-headline");
          tl.to(
            bit,
            {
              autoAlpha: 1,
              y: 0,
              ...(isHeadline ? { scale: 1 } : {}),
              duration: isHeadline ? 0.95 : 0.75,
              ease: isHeadline ? "power3.out" : "power2.out",
            },
            index * 0.14
          );
        });
      }
    },
    { scope: rootRef, dependencies: [wishes.length] }
  );

  return (
    <article
      ref={rootRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#000000_0%,#1a0409_40%,#430a17_80%,#570d1e_100%)] text-[#fff5f7]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-5%,rgba(194,58,85,0.28),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_40%,rgba(232,180,189,0.08),transparent_50%)]"
        aria-hidden
      />

      {/* Hero — brand + one CTA */}
      <header
        data-hbd-intro
        className="relative flex min-h-[100dvh] flex-col pb-16 pt-28 sm:pt-32"
      >
        <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 text-center sm:px-10">
          <p
            data-hbd-anim
            className="inline-flex self-center rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[0.7rem] tracking-[0.2em] text-gold-soft"
          >
            {hbd.occasionLabel ?? "Birthday"}
            {/* {hbd.year ? ` · ${hbd.year}` : null} */}
          </p>

          <h1
            data-hbd-anim
            className={cn(
              DISPLAY,
              "mt-5 text-4xl font-normal tracking-[0.04em] sm:text-6xl md:text-7xl"
            )}
          >
            {hbd.title}
          </h1>

          {hbd.titleLocal ? (
            <p
              data-hbd-anim
              className="mt-4 font-script text-2xl text-gold-soft sm:text-3xl"
            >
              {hbd.titleLocal}
            </p>
          ) : null}

          <div
            data-hbd-anim
            className="mx-auto mt-6 max-w-lg space-y-1 text-base leading-relaxed text-[#f7d7de]/85 sm:text-lg"
          >
            {hbd.subtitle.includes("—") || hbd.subtitle.includes("–") ? (
              <div className="flex flex-col items-center gap-3">
                <p>{hbd.subtitle.split(/\s*[—–]\s*/)[0]}</p>
                <RoyalDivider />
                {hbd.subtitle.split(/\s*[—–]\s*/).slice(1).join(" — ").trim() ? (
                  <p className="text-[#e8b4bd]/70">
                    {hbd.subtitle.split(/\s*[—–]\s*/).slice(1).join(" — ")}
                  </p>
                ) : null}
              </div>
            ) : (
              <p>{hbd.subtitle}</p>
            )}
          </div>

          <div
            data-hbd-anim
            className="mt-4 flex flex-col items-center gap-4"
          >
            {hbd.invitation ? (
              <p className="text-base text-[#e8b4bd]/85 sm:text-lg">
                {hbd.invitation}
              </p>
            ) : null}
            <Link
              href="/upload"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#c23a55] px-6 py-3.5 text-sm font-normal text-white shadow-[0_10px_30px_rgba(194,58,85,0.35)] transition hover:bg-[#d9506b]"
            >
              <Sparkles className="size-4" />
              ส่งของขวัญตรงนี้
            </Link>
          </div>

          <div
            data-hbd-anim
            className="mt-16 flex flex-col items-center gap-2 text-[#e8b4bd]/60"
          >
            <ChevronDown className="size-5 animate-bounce" aria-hidden />
          </div>
        </div>
      </header>

      {/* Wishes — full card art, stacked reading column */}
      <div className="relative mx-auto flex max-w-2xl flex-col gap-20 px-4 pb-16 sm:gap-28 sm:px-6 sm:pb-24">
        {wishes.map((wish, index) => (
          <section
            key={wish.id}
            data-hbd-card
            className="will-change-transform"
            aria-label={`คำอวยพรจาก ${wish.from}`}
          >
            <div
              data-hbd-media
              className="relative overflow-hidden rounded-3xl bg-black/25 ring-1 ring-gold/35 shadow-[0_24px_60px_rgba(0,0,0,0.4),0_0_32px_rgba(227,192,122,0.08)] will-change-transform"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-1.5 z-10 rounded-[1.25rem] border border-gold/20 sm:inset-2"
              />
              {wish.image ? (
                <button
                  type="button"
                  data-hbd-media-inner
                  onClick={() => openLightbox(wish.id)}
                  aria-label={`ดูรูปใหญ่ — จาก ${wish.from}`}
                  className="flex w-full cursor-zoom-in justify-center p-3.5 will-change-transform transition hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c23a55]/60 focus-visible:ring-inset sm:p-5"
                >
                  <ProtectedImage
                    src={wish.image}
                    alt={wish.alt ?? `Wish from ${wish.from}`}
                    loading={
                      !wish.loadOnDemand && index < EAGER_CARD_COUNT
                        ? "eager"
                        : "lazy"
                    }
                    decoding="async"
                    className="h-auto w-full max-w-full object-contain [aspect-ratio:auto_2000/1414]"
                  />
                </button>
              ) : (
                <div className="flex min-h-[20rem] items-center justify-center text-gold opacity-40">
                  <Crown className="size-16" aria-hidden />
                </div>
              )}
            </div>

            <div data-hbd-copy className="mt-7 px-1 text-center sm:mt-8">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <ProtectedImage
                  src={wish.avatar || HBD_AVATAR_DEFAULT}
                  alt=""
                  loading={index < EAGER_CARD_COUNT ? "eager" : "lazy"}
                  decoding="async"
                  className="size-12 shrink-0 rounded-full object-cover ring-2 ring-gold/40 sm:size-14"
                />
                <div className="min-w-0 text-left">
                  <p className="font-script text-base leading-tight text-gold sm:text-lg">
                    จาก
                  </p>
                  <h2
                    className={cn(
                      DISPLAY,
                      "text-2xl font-normal leading-snug sm:text-3xl"
                    )}
                  >
                    {wish.from}
                  </h2>
                </div>
              </div>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#f7d7de]/90 sm:text-lg">
                {wish.message}
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* Closing */}
      <footer
        data-hbd-close
        className="relative px-5 py-24 text-center sm:px-8 sm:py-32"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(194,58,85,0.26),transparent_58%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl">
          {hbd.closingMessage ? (
            <div
              className={cn(
                DISPLAY,
                "mx-auto flex max-w-2xl flex-col items-center gap-4 sm:gap-5"
              )}
            >
              <p
                data-hbd-anim
                className="text-gold drop-shadow-[0_0_14px_rgba(227,192,122,0.35)]"
                aria-hidden
              >
                <Crown className="size-8 sm:size-10" strokeWidth={1.5} />
              </p>
              {hbd.closingMessage.includes("—") ||
              hbd.closingMessage.includes("–") ? (
                <>
                  <p
                    data-hbd-anim
                    data-hbd-close-headline
                    className="font-script text-4xl font-normal leading-tight text-balance text-gold-soft sm:text-5xl"
                  >
                    {hbd.closingMessage.split(/\s*[—–]\s*/)[0]}
                  </p>
                  <RoyalDivider data-hbd-anim />
                  {hbd.closingMessage
                    .split(/\s*[—–]\s*/)
                    .slice(1)
                    .join(" — ")
                    .trim() ? (
                    <p
                      data-hbd-anim
                      className="max-w-md text-lg font-normal leading-relaxed text-[#e8b4bd]/90 sm:text-2xl"
                    >
                      {hbd.closingMessage
                        .split(/\s*[—–]\s*/)
                        .slice(1)
                        .join(" — ")}
                    </p>
                  ) : null}
                </>
              ) : (
                <p
                  data-hbd-anim
                  data-hbd-close-headline
                  className="font-script text-4xl font-normal leading-tight text-balance text-gold-soft sm:text-5xl"
                >
                  {hbd.closingMessage}
                </p>
              )}
              {hbd.closingNote?.length ? (
                <div
                  data-hbd-anim
                  className="space-y-1 font-script text-2xl leading-relaxed text-[#f7d7de] sm:text-3xl"
                >
                  {hbd.closingNote.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ) : null}
              <p
                data-hbd-anim
                className="mt-2 text-xl opacity-80 sm:text-2xl"
                aria-hidden
              >
                ☀️🌙
              </p>
            </div>
          ) : null}
        </div>
      </footer>

      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null);
        }}
      >
        <DialogContent
          className="flex h-[calc(100dvh-0.75rem)] max-h-[calc(100dvh-0.75rem)] w-[calc(100vw-0.75rem)] max-w-none flex-col gap-2 overflow-hidden rounded-2xl border-[#e8b4bd]/20 bg-[#000000] p-2 text-[#fff5f7] sm:h-[calc(100dvh-1.25rem)] sm:max-h-[calc(100dvh-1.25rem)] sm:w-[calc(100vw-1.25rem)] sm:max-w-none sm:gap-3 sm:p-3"
          showCloseButton
        >
          {activeLightbox ? (
            <>
              <DialogHeader className="shrink-0 px-1 pt-0.5 pr-10 sm:px-2">
                <DialogTitle className={cn(DISPLAY, "text-base sm:text-lg")}>
                  จาก {activeLightbox.from}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  ดูการ์ดถวายพรขนาดใหญ่
                </DialogDescription>
              </DialogHeader>

              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
                <ProtectedImage
                  src={activeLightbox.src}
                  alt={activeLightbox.alt}
                  className="max-h-full max-w-full h-auto w-auto object-contain"
                />

                {lightboxItems.length > 1 ? (
                  <>
                    <button
                      type="button"
                      aria-label="รูปก่อนหน้า"
                      onClick={goPrev}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "absolute top-1/2 left-1 size-10 -translate-y-1/2 rounded-full border border-[#e8b4bd]/25 bg-[#000000]/85 text-[#fff5f7] backdrop-blur-sm transition hover:bg-[#c23a55]/90 hover:text-[#fff5f7] sm:left-3"
                      )}
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="รูปถัดไป"
                      onClick={goNext}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "absolute top-1/2 right-1 size-10 -translate-y-1/2 rounded-full border border-[#e8b4bd]/25 bg-[#000000]/85 text-[#fff5f7] backdrop-blur-sm transition hover:bg-[#c23a55]/90 hover:text-[#fff5f7] sm:right-3"
                      )}
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 px-1 pb-0.5 sm:px-2">
                <p className="text-sm tracking-wide text-[#e8b4bd]/70">
                  {(lightboxIndex ?? 0) + 1} / {lightboxItems.length}
                </p>
                <button
                  type="button"
                  onClick={downloadActive}
                  disabled={downloading}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    CTA_PRIMARY_CLASS,
                    "h-10 gap-1.5 px-4 text-sm font-semibold sm:h-11 sm:px-5"
                  )}
                >
                  {downloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  {downloading ? "กำลังเตรียมไฟล์…" : "ดาวน์โหลดรูป"}
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </article>
  );
}
