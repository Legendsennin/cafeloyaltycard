"use client";

import { Html5Qrcode } from "html5-qrcode";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CircleAlert,
  Coffee,
  Gift,
  LoaderCircle,
  QrCode,
  ScanLine,
  X,
} from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import PakInchikLogo from "@/components/PakInchikLogo";
import { Button } from "@/components/ui/button";

const DEMO_QR_TOKEN = "PAK_INCHIK_COFFEE_2026";
const TOTAL_STAMPS = 8;
const READER_ID = "punchcard-live-reader";
const STAMP_ITEMS = Array.from({ length: TOTAL_STAMPS });

type RewardState = "collecting" | "earned";
type ScannerState =
  | "idle"
  | "requesting"
  | "scanning"
  | "invalid"
  | "camera-error";

export default function PunchCardExperience() {
  const [stamps, setStamps] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerState, setScannerState] = useState<ScannerState>("idle");
  const [scannerAttempt, setScannerAttempt] = useState(0);
  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Your punch card is ready for its first stamp."
  );
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const stampsRef = useRef(0);
  const scanHandledRef = useRef(false);

  const remaining = Math.max(TOTAL_STAMPS - stamps, 0);
  const rewardState: RewardState = stamps >= TOTAL_STAMPS ? "earned" : "collecting";

  useEffect(() => {
    stampsRef.current = stamps;
  }, [stamps]);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;

    if (!scanner) {
      return;
    }

    try {
      await scanner.stop();
    } catch {
      // The scanner may not have reached an active state yet.
    }

    try {
      await scanner.clear();
    } catch {
      // Clearing is best-effort when the reader has already unmounted.
    }
  }, []);

  const finishValidScan = useCallback(async () => {
    if (scanHandledRef.current) {
      return;
    }

    scanHandledRef.current = true;
    await stopScanner();
    setIsScannerOpen(false);

    const nextStamps = Math.min(stampsRef.current + 1, TOTAL_STAMPS);
    stampsRef.current = nextStamps;
    setStamps(nextStamps);

    if (nextStamps === TOTAL_STAMPS) {
      setIsRewardOpen(true);
      setStatusMessage("Reward unlocked. Claim your free Americano at the counter.");
      return;
    }

    setScannerState("idle");
    setStatusMessage(
      `Stamp collected. ${TOTAL_STAMPS - nextStamps} more until your free Americano.`
    );
  }, [stopScanner]);

  useEffect(() => {
    if (!isScannerOpen) {
      return;
    }

    let isCurrentAttempt = true;

    const startScanner = async () => {
      setScannerState("requesting");
      setStatusMessage("Requesting access to your camera.");
      scanHandledRef.current = false;

      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() => resolve())
      );

      if (!isCurrentAttempt) {
        return;
      }

      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (
              !isCurrentAttempt ||
              scannerRef.current !== scanner ||
              scanHandledRef.current
            ) {
              return;
            }

            if (decodedText.trim() === DEMO_QR_TOKEN) {
              void finishValidScan();
              return;
            }

            setScannerState("invalid");
            setStatusMessage("That code is not the Pak Inchik cafe code. Try again.");
          },
          () => undefined
        );

        if (isCurrentAttempt && scannerRef.current === scanner) {
          setScannerState("scanning");
          setStatusMessage("Camera ready. Scan the Pak Inchik cafe code.");
        }
      } catch {
        scannerRef.current = null;

        if (isCurrentAttempt) {
          setScannerState("camera-error");
          setStatusMessage(
            "Camera access was unavailable. Check permission and try again."
          );
        }
      }
    };

    void startScanner();

    return () => {
      isCurrentAttempt = false;
      void stopScanner();
    };
  }, [finishValidScan, isScannerOpen, scannerAttempt, stopScanner]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const openScanner = () => {
    if (isRewardOpen) {
      return;
    }

    setScannerState("requesting");
    setIsScannerOpen(true);
  };

  const closeScanner = useCallback(async () => {
    await stopScanner();
    setIsScannerOpen(false);
    setScannerState("idle");
    setStatusMessage("Scanner closed. Your current stamps are unchanged.");
  }, [stopScanner]);

  const retryCamera = useCallback(async () => {
    await stopScanner();
    setScannerState("requesting");
    setScannerAttempt((current) => current + 1);
  }, [stopScanner]);

  const resetAfterReward = useCallback(() => {
    setIsRewardOpen(false);
    stampsRef.current = 0;
    setStamps(0);
    setScannerState("idle");
    setStatusMessage("New punch card started. Scan after your next purchase.");
  }, []);

  useEffect(() => {
    if (!isScannerOpen && !isRewardOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isScannerOpen) {
        void closeScanner();
      } else {
        resetAfterReward();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeScanner, isRewardOpen, isScannerOpen, resetAfterReward]);

  return (
    <PunchCardShell>
      <span className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </span>

      <section className="grid w-full max-w-md gap-3 md:max-w-5xl md:grid-cols-[0.95fr_1.05fr] md:items-stretch md:gap-6">
        <RewardProgress stamps={stamps} remaining={remaining} rewardState={rewardState} />

        <div className="flex min-h-full flex-col gap-3 rounded-xl border border-[#5A3827]/15 bg-[#FFF7EA] p-3 text-[#211813] shadow-[0_4px_16px_rgba(33,24,19,0.12)] sm:gap-4 sm:p-5 md:p-6">
          <ProgressSummary stamps={stamps} remaining={remaining} />
          <StampGrid stamps={stamps} rewardState={rewardState} />

          <Button
            type="button"
            onClick={openScanner}
            disabled={isRewardOpen}
            className="mt-auto h-11 w-full rounded-lg bg-[#D99A3E] px-3 text-sm font-bold text-[#211813] shadow-[0_4px_12px_rgba(217,154,62,0.24)] hover:bg-[#E7B25F] focus-visible:ring-[#D99A3E]/45 sm:h-12 sm:px-5 sm:text-base"
          >
            <ScanLine className="size-5" aria-hidden="true" />
            Scan QR
          </Button>
        </div>
      </section>

      <ScannerModal
        isOpen={isScannerOpen}
        scannerState={scannerState}
        onClose={() => void closeScanner()}
        onRetry={() => void retryCamera()}
      />

      <RewardModal isOpen={isRewardOpen} onClose={resetAfterReward} />
    </PunchCardShell>
  );
}

function PunchCardShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#FFF7EA] text-[#211813]">
      <div className="relative flex min-h-dvh items-center justify-center px-3 py-3 sm:px-6 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(159,188,143,0.44),transparent_32%),linear-gradient(135deg,#FFF7EA_0%,#F3E0BF_45%,#5A3827_140%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,rgba(33,24,19,0.12))]" />
        <div className="relative z-10 flex w-full flex-col items-center gap-3 sm:gap-5">
          <div className="flex w-full max-w-md items-center justify-center md:max-w-5xl">
            <PakInchikLogo className="h-auto w-20 text-[#211813] sm:w-32" />
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
}: {
  stamps: number;
  remaining: number;
  rewardState: RewardState;
}) {
  const progress = Math.round((stamps / TOTAL_STAMPS) * 100);

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative flex min-h-[172px] flex-col overflow-hidden rounded-xl bg-[#211813] p-4 text-[#FFF7EA] shadow-[0_4px_16px_rgba(33,24,19,0.2)] sm:min-h-[260px] sm:p-6 md:min-h-[620px]"
    >
      <div className="absolute inset-x-6 top-0 h-2 rounded-b-full bg-[#D99A3E]" />
      <div className="absolute -right-16 top-20 size-40 rounded-full border border-[#FFF7EA]/10" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#D99A3E]">
            Pak Inchik rewards
          </p>
          <h1 className="mt-2 max-w-80 text-2xl font-black leading-[0.95] tracking-normal sm:mt-3 sm:text-3xl md:text-5xl">
            {rewardState === "earned" ? "Free brew unlocked" : "Your next cup is brewing"}
          </h1>
        </div>
        <div className="grid size-10 place-items-center rounded-lg bg-[#FFF7EA]/10 text-[#D99A3E] sm:size-12">
          {rewardState === "earned" ? <Gift className="size-6" aria-hidden="true" /> : <Coffee className="size-6" aria-hidden="true" />}
        </div>
      </div>
      <div className="relative mt-auto pt-4 sm:pt-10">
        <div className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-[#FFF7EA]/12 bg-[#FFF7EA]/8 p-3 sm:gap-4 sm:rounded-xl sm:p-4">
          <div className="grid size-12 place-items-center rounded-lg bg-[#FFF7EA] text-xl font-black text-[#211813] sm:size-16 sm:rounded-xl sm:text-2xl">{stamps}</div>
          <div>
            <p className="text-sm font-semibold text-[#FFF7EA]/80">
              {rewardState === "earned" ? "Claim your reward at the counter." : `${remaining} stamps until a free Americano.`}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#FFF7EA]/15 sm:mt-3" aria-hidden="true">
              <div className="h-full rounded-full bg-[#9FBC8F] transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#FFF7EA]/55 sm:mt-2 sm:text-xs sm:tracking-[0.18em]">{progress}% complete</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

function ProgressSummary({ stamps, remaining }: { stamps: number; remaining: number }) {
  return (
    <header className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B64A3B]">Digital punch card</p>
        <h2 className="mt-1 text-base font-black tracking-normal text-[#211813] sm:mt-2 sm:text-xl">Collect 8 stamps for a free brew.</h2>
        <p className="mt-1 hidden max-w-md text-sm leading-6 text-[#5A3827] sm:mt-2 sm:block">Scan the cafe QR after purchase. Each verified visit marks the next spot on your receipt strip.</p>
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
    <div className="rounded-lg border border-[#5A3827]/12 bg-white/55 p-2 sm:p-3">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#5A3827]/65">{label}</p>
      <p className="mt-1 text-xl font-black text-[#211813]">{value}</p>
    </div>
  );
}

function StampGrid({ stamps, rewardState }: { stamps: number; rewardState: RewardState }) {
  return (
    <section aria-label="Reward stamp progress" className="relative overflow-hidden rounded-xl border border-[#5A3827]/15 bg-[#F8E9CB] p-2 sm:p-4">
      <div className="absolute inset-y-3 left-0 w-3 rounded-r-full bg-[#FFF7EA]" />
      <div className="absolute inset-y-3 right-0 w-3 rounded-l-full bg-[#FFF7EA]" />
      <div className="relative rounded-lg border border-dashed border-[#5A3827]/25 bg-[#FFF7EA] p-2 sm:rounded-xl sm:p-4">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {STAMP_ITEMS.map((_, index) => {
            const isStamped = index < stamps;
            const isNext = index === stamps && rewardState !== "earned";
            const isReward = index === TOTAL_STAMPS - 1;
            return (
              <div key={index} className="aspect-square min-w-0" aria-label={`Stamp ${index + 1} ${isStamped ? "collected" : "empty"}`}>
                <div className={["grid size-full place-items-center rounded-lg border text-sm font-black transition-all duration-300", isStamped ? "rotate-[-3deg] border-[#D99A3E]/55 bg-[#D99A3E] text-[#211813] shadow-[0_6px_14px_rgba(217,154,62,0.22)]" : "border-dashed border-[#5A3827]/22 bg-[#FFF7EA] text-[#5A3827]/35", isNext ? "ring-4 ring-[#9FBC8F]/40" : "", isReward && !isStamped ? "border-[#B64A3B]/35 text-[#B64A3B]/55" : ""].join(" ")}>
                  {isStamped ? <Check className="size-5" aria-hidden="true" /> : isReward ? <Gift className="size-5" aria-hidden="true" /> : index + 1}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-dashed border-[#5A3827]/20 pt-2 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[#5A3827]/65 sm:mt-4 sm:pt-3 sm:text-xs sm:tracking-[0.18em]">
          <span>Receipt strip</span>
          <span>Free Americano</span>
        </div>
      </div>
    </section>
  );
}

function ScannerModal({ isOpen, scannerState, onClose, onRetry }: { isOpen: boolean; scannerState: ScannerState; onClose: () => void; onRetry: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:grid sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="scanner-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close scanner" className="absolute inset-0 bg-[#211813]/75 backdrop-blur-sm" onClick={onClose} />
          <motion.section initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }} className="relative mx-auto my-auto w-full max-w-sm rounded-xl border border-[#FFF7EA]/12 bg-[#211813] p-4 text-[#FFF7EA] shadow-[0_8px_24px_rgba(33,24,19,0.28)] sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D99A3E]">Cafe QR</p>
                <h2 id="scanner-title" className="mt-2 text-xl font-black">Scan to collect</h2>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-lg text-[#FFF7EA]/70 hover:bg-[#FFF7EA]/10 hover:text-[#FFF7EA]" aria-label="Close scanner"><X className="size-5" aria-hidden="true" /></Button>
            </div>
            {scannerState === "camera-error" ? <ScannerError onRetry={onRetry} onClose={onClose} /> : <>
              <div className="mt-5 overflow-hidden rounded-lg border border-[#D99A3E]/35 bg-black"><div id={READER_ID} className="min-h-[288px] [&_video]:h-[288px] [&_video]:w-full [&_video]:object-cover" /></div>
              {scannerState === "requesting" ? <p className="mt-4 flex items-center gap-2 text-sm text-[#FFF7EA]/75"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Opening your camera…</p> : scannerState === "invalid" ? <p className="mt-4 flex gap-2 text-sm leading-6 text-[#F4B0A4]"><CircleAlert className="mt-1 size-4 shrink-0" aria-hidden="true" />This is not the Pak Inchik cafe code. Keep the camera open and try again.</p> : <p className="mt-4 text-sm leading-6 text-[#FFF7EA]/75">Keep the QR square inside the camera frame.</p>}
            </>}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ScannerError({ onRetry, onClose }: { onRetry: () => void; onClose: () => void }) {
  return (
    <div className="mt-5 border border-[#B64A3B]/50 bg-[#B64A3B]/12 p-4">
      <CircleAlert className="size-8 text-[#F4B0A4]" aria-hidden="true" />
      <p className="mt-3 text-lg font-black">Camera unavailable</p>
      <p className="mt-2 text-sm leading-6 text-[#FFF7EA]/78">Allow camera access in your browser, then try again.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button type="button" onClick={onRetry} className="h-10 rounded-lg bg-[#D99A3E] font-bold text-[#211813] hover:bg-[#E7B25F]">Try again</Button>
        <Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-lg border-[#FFF7EA]/20 bg-transparent text-[#FFF7EA] hover:bg-white/10 hover:text-white">Cancel</Button>
      </div>
    </div>
  );
}

function RewardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="reward-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close reward" className="absolute inset-0 bg-[#211813]/75 backdrop-blur-sm" onClick={onClose} />
          <motion.section initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 12 }} className="relative w-full max-w-sm rounded-xl border border-[#D99A3E]/45 bg-[#FFF7EA] p-5 text-[#211813] shadow-[0_8px_24px_rgba(33,24,19,0.28)] sm:p-6">
            <Button type="button" variant="ghost" size="icon" onClick={onClose} className="absolute right-3 top-3 rounded-lg text-[#5A3827] hover:bg-[#5A3827]/10" aria-label="Close reward"><X className="size-5" aria-hidden="true" /></Button>
            <div className="grid size-12 place-items-center rounded-lg bg-[#D99A3E] text-[#211813]"><Gift className="size-6" aria-hidden="true" /></div>
            <h2 id="reward-title" className="mt-5 text-2xl font-black">Free Americano unlocked</h2>
            <p className="mt-3 text-base leading-7 text-[#5A3827]">Claim your free Americano at the counter.</p>
            <div className="mt-5 flex items-center gap-2 border-t border-dashed border-[#5A3827]/20 pt-4 text-sm font-semibold text-[#5A3827]"><QrCode className="size-4 text-[#B64A3B]" aria-hidden="true" />Show this completed card to the barista.</div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
