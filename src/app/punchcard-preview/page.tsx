"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Coffee,
  Gift,
  QrCode,
  RotateCcw,
  ScanLine,
  Sparkles,
  X,
} from "lucide-react";

import PakInchikLogo from "@/components/PakInchikLogo";
import { Button } from "@/components/ui/button";

const TOTAL_STAMPS = 8;
const DEMO_INITIAL_STAMPS = 3;

type RewardState = "collecting" | "earned";

export default function PunchCardPreview() {
  const [stamps, setStamps] = useState(DEMO_INITIAL_STAMPS);
  const [rewardState, setRewardState] = useState<RewardState>("collecting");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Preview loaded with 3 stamps collected."
  );

  const remaining = Math.max(TOTAL_STAMPS - stamps, 0);

  const addStamp = () => {
    if (stamps >= TOTAL_STAMPS - 1) {
      setStamps(TOTAL_STAMPS);
      setRewardState("earned");
      setIsScannerOpen(false);
      setStatusMessage("Reward earned. Your free brew is ready.");
      return;
    }

    setStamps((current) => current + 1);
    setIsScannerOpen(false);
    setStatusMessage(`Stamp added. ${remaining - 1} more to unlock a reward.`);
  };

  const resetPreview = () => {
    setStamps(DEMO_INITIAL_STAMPS);
    setRewardState("collecting");
    setStatusMessage("Preview reset to 3 stamps collected.");
  };

  return (
    <PunchCardShell>
      <span className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </span>

      <section className="grid w-full max-w-md gap-5 md:max-w-5xl md:grid-cols-[0.95fr_1.05fr] md:items-stretch md:gap-6">
        <RewardProgress
          stamps={stamps}
          remaining={remaining}
          rewardState={rewardState}
          onReset={resetPreview}
        />

        <div className="flex min-h-full flex-col gap-4 rounded-2xl border border-[#5A3827]/15 bg-[#FFF7EA] p-4 text-[#211813] shadow-[0_24px_80px_rgba(33,24,19,0.16)] sm:p-5 md:p-6">
          <ProgressSummary stamps={stamps} remaining={remaining} />

          <StampGrid stamps={stamps} rewardState={rewardState} />

          <div className="mt-auto grid gap-3 pt-2 sm:grid-cols-[1fr_auto] sm:items-center">
            <Button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="h-12 w-full rounded-xl bg-[#D99A3E] px-5 text-base font-bold text-[#211813] shadow-[0_14px_30px_rgba(217,154,62,0.32)] hover:bg-[#E7B25F] focus-visible:ring-[#D99A3E]/45"
            >
              <ScanLine className="size-5" aria-hidden="true" />
              Scan QR
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={addStamp}
              className="h-12 rounded-xl border-[#5A3827]/20 bg-white/55 px-4 text-[#5A3827] hover:bg-white"
            >
              Demo stamp
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>

      <ScanQrModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={addStamp}
      />
    </PunchCardShell>
  );
}

function PunchCardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#FFF7EA] text-[#211813]">
      <div className="relative flex min-h-dvh items-center justify-center px-4 py-4 sm:px-6 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(159,188,143,0.44),transparent_32%),linear-gradient(135deg,#FFF7EA_0%,#F3E0BF_45%,#5A3827_140%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,rgba(33,24,19,0.12))]" />

        <div className="relative z-10 flex w-full flex-col items-center gap-5">
          <div className="flex w-full max-w-md items-center justify-center md:max-w-5xl">
            <PakInchikLogo className="h-auto w-24 text-[#211813] sm:w-32" />
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}

function RewardProgress({
  stamps,
  remaining,
  rewardState,
  onReset,
}: {
  stamps: number;
  remaining: number;
  rewardState: RewardState;
  onReset: () => void;
}) {
  const progress = Math.round((stamps / TOTAL_STAMPS) * 100);

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative flex min-h-[360px] flex-col overflow-hidden rounded-2xl bg-[#211813] p-5 text-[#FFF7EA] shadow-[0_26px_90px_rgba(33,24,19,0.32)] sm:p-6 md:min-h-[620px]"
    >
      <div className="absolute inset-x-6 top-0 h-2 rounded-b-full bg-[#D99A3E]" />
      <div className="absolute -right-16 top-20 size-40 rounded-full border border-[#FFF7EA]/10" />
      <div className="absolute -bottom-20 -left-14 size-48 rounded-full bg-[#9FBC8F]/15 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D99A3E]">
            Pak Inchik rewards
          </p>
          <h1 className="mt-3 max-w-80 text-3xl font-black leading-[0.95] tracking-normal md:text-5xl">
            {rewardState === "earned" ? "Free brew unlocked" : "Your next cup is brewing"}
          </h1>
        </div>
        <div className="grid size-12 place-items-center rounded-xl bg-[#FFF7EA]/10 text-[#D99A3E]">
          {rewardState === "earned" ? (
            <Gift className="size-6" aria-hidden="true" />
          ) : (
            <Coffee className="size-6" aria-hidden="true" />
          )}
        </div>
      </div>

      <div className="relative mt-auto pt-10">
        <div className="grid grid-cols-[auto_1fr] gap-4 rounded-2xl border border-[#FFF7EA]/12 bg-[#FFF7EA]/8 p-4">
          <div className="grid size-16 place-items-center rounded-xl bg-[#FFF7EA] text-2xl font-black text-[#211813]">
            {stamps}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#FFF7EA]/80">
              {rewardState === "earned"
                ? "Show this reward at the counter."
                : `${remaining} stamps until a free Americano.`}
            </p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-[#FFF7EA]/15"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-[#9FBC8F] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FFF7EA]/55">
              {progress}% complete
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={onReset}
          className="mt-4 h-10 rounded-xl px-3 text-[#FFF7EA]/75 hover:bg-[#FFF7EA]/10 hover:text-[#FFF7EA]"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset preview
        </Button>
      </div>
    </motion.aside>
  );
}

function ProgressSummary({
  stamps,
  remaining,
}: {
  stamps: number;
  remaining: number;
}) {
  return (
    <header className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B64A3B]">
          Digital punch card
        </p>
        <h2 className="mt-2 text-xl font-black tracking-normal text-[#211813]">
          Collect 8 stamps for a free brew.
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-[#5A3827]">
          Scan the staff QR after purchase. Each verified visit marks the next
          spot on your receipt strip.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:w-44">
        <Metric label="Stamps" value={`${stamps}/8`} />
        <Metric label="Left" value={`${remaining}`} />
      </div>
    </header>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#5A3827]/12 bg-white/55 p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#5A3827]/65">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-[#211813]">{value}</p>
    </div>
  );
}

function StampGrid({
  stamps,
  rewardState,
}: {
  stamps: number;
  rewardState: RewardState;
}) {
  const stampItems = useMemo(() => Array.from({ length: TOTAL_STAMPS }), []);

  return (
    <section
      aria-label="Reward stamp progress"
      className="relative overflow-hidden rounded-2xl border border-[#5A3827]/15 bg-[#F8E9CB] p-3 shadow-inner sm:p-4"
    >
      <div className="absolute inset-y-3 left-0 w-3 rounded-r-full bg-[#FFF7EA]" />
      <div className="absolute inset-y-3 right-0 w-3 rounded-l-full bg-[#FFF7EA]" />

      <div className="relative rounded-xl border border-dashed border-[#5A3827]/25 bg-[#FFF7EA] p-3 sm:p-4">
        <div className="grid grid-cols-4 gap-3">
          {stampItems.map((_, index) => {
            const isStamped = index < stamps;
            const isNext = index === stamps && rewardState !== "earned";
            const isReward = index === TOTAL_STAMPS - 1;

            return (
              <motion.div
                key={index}
                layout
                className="aspect-square min-w-0"
                aria-label={`Stamp ${index + 1} ${
                  isStamped ? "collected" : "empty"
                }`}
              >
                <div
                  className={[
                    "grid size-full place-items-center rounded-xl border text-sm font-black transition-all duration-300",
                    isStamped
                      ? "rotate-[-3deg] border-[#D99A3E]/55 bg-[#D99A3E] text-[#211813] shadow-[0_10px_22px_rgba(217,154,62,0.25)]"
                      : "border-dashed border-[#5A3827]/22 bg-[#FFF7EA] text-[#5A3827]/35",
                    isNext ? "ring-4 ring-[#9FBC8F]/40" : "",
                    isReward && !isStamped ? "border-[#B64A3B]/35 text-[#B64A3B]/55" : "",
                  ].join(" ")}
                >
                  {isStamped ? (
                    <Check className="size-5" aria-hidden="true" />
                  ) : isReward ? (
                    <Gift className="size-5" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#5A3827]/20 pt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#5A3827]/65">
          <span>Receipt strip</span>
          <span>Free Americano</span>
        </div>
      </div>
    </section>
  );
}

function ScanQrModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scanner-preview-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close scanner preview"
            className="absolute inset-0 bg-[#211813]/72 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
            className="relative w-full max-w-sm rounded-2xl border border-[#FFF7EA]/12 bg-[#211813] p-4 text-[#FFF7EA] shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D99A3E]">
                  Staff QR
                </p>
                <h3 id="scanner-preview-title" className="mt-2 text-xl font-black">
                  Scan to collect
                </h3>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-xl text-[#FFF7EA]/70 hover:bg-[#FFF7EA]/10 hover:text-[#FFF7EA]"
                aria-label="Close scanner preview"
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-[#D99A3E]/35 bg-black">
              <div className="relative aspect-square">
                <div className="absolute inset-5 rounded-xl border border-[#FFF7EA]/10 bg-[linear-gradient(135deg,rgba(255,247,234,0.12),rgba(159,188,143,0.08))]" />
                <QrCode className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 text-[#FFF7EA]/28" />
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-[#9FBC8F] shadow-[0_0_22px_rgba(159,188,143,0.9)]" />
                <Corner className="left-5 top-5 border-l border-t" />
                <Corner className="right-5 top-5 border-r border-t" />
                <Corner className="bottom-5 left-5 border-b border-l" />
                <Corner className="bottom-5 right-5 border-b border-r" />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#FFF7EA]/72">
              This is a preview modal. The final punch card can use the existing
              QR validation flow.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={onSuccess}
                className="h-11 rounded-xl bg-[#9FBC8F] font-bold text-[#211813] hover:bg-[#B2CBA5]"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                Simulate scan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-11 rounded-xl border-[#FFF7EA]/15 bg-transparent text-[#FFF7EA] hover:bg-[#FFF7EA]/10 hover:text-[#FFF7EA]"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <div
      className={`absolute size-10 rounded-[0.65rem] border-[#D99A3E] ${className}`}
      aria-hidden="true"
    />
  );
}
