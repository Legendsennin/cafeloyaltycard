"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, Coffee, RefreshCw, ScanLine } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import PakInchikLogo from "@/components/PakInchikLogo";
import { Button } from "@/components/ui/button";

const DEMO_QR_TOKEN = "PAK_INCHIK_COFFEE_2026";
const QR_LIFETIME_SECONDS = 60;

type ShiftEntry = {
  time: string;
  title: string;
  detail: string;
  tone: "sage" | "gold" | "clay";
};

const INITIAL_SHIFT_LOG: ShiftEntry[] = [
  { time: "14:28", title: "Reward redeemed", detail: "Free Americano · Sarah J.", tone: "gold" },
  { time: "14:15", title: "Stamp collected", detail: "Member visit verified", tone: "sage" },
  { time: "13:50", title: "Scan needs retry", detail: "Customer opened a new code", tone: "clay" },
];

const entryTone: Record<ShiftEntry["tone"], string> = {
  sage: "border-[#9FBC8F]",
  gold: "border-[#D99A3E]",
  clay: "border-[#B64A3B]",
};

export default function BaristaPreviewPage() {
  const [secondsRemaining, setSecondsRemaining] = useState(QR_LIFETIME_SECONDS);
  const [shiftLog, setShiftLog] = useState(INITIAL_SHIFT_LOG);
  const [status, setStatus] = useState("QR display ready for the next customer.");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => current <= 1 ? QR_LIFETIME_SECONDS : current - 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const refreshCode = () => {
    setSecondsRemaining(QR_LIFETIME_SECONDS);
    setShiftLog((current) => [
      { time: "Now", title: "QR display refreshed", detail: "The static demo code is ready to scan", tone: "sage" },
      ...current,
    ]);
    setStatus("QR display refreshed. The demo code is ready to scan.");
  };

  const isExpiringSoon = secondsRemaining <= 10;

  return (
    <main className="min-h-dvh bg-[#FFF7EA] px-4 py-5 text-[#211813] sm:px-6 sm:py-8">
      <span className="sr-only" aria-live="polite" role="status">{status}</span>
      <section className="mx-auto w-full max-w-6xl overflow-hidden rounded-xl border border-[#5A3827]/20 bg-white shadow-[0_4px_16px_rgba(33,24,19,0.12)]">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-[#5A3827]/15 bg-[#211813] px-5 py-3 text-[#FFF7EA] sm:px-6">
          <div className="flex items-center gap-4">
            <PakInchikLogo className="h-auto w-24 text-[#FFF7EA] sm:w-28" />
            <span className="hidden h-7 w-px bg-[#FFF7EA]/20 sm:block" />
            <span className="flex items-center gap-2 text-sm font-semibold text-[#FFF7EA]/82"><Coffee className="size-4 text-[#D99A3E]" aria-hidden="true" />Counter display</span>
          </div>
          <span className="font-mono text-sm tabular-nums text-[#FFF7EA]/72">14:32</span>
        </header>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.65fr)_minmax(290px,0.85fr)]">
          <section className="flex min-h-[580px] flex-col items-center justify-center px-5 py-10 sm:px-10">
            <div className="flex w-full max-w-xl flex-col items-center text-center">
              <ScanLine className="mb-4 size-6 text-[#D99A3E]" aria-hidden="true" />
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Ask your customer to scan</h1>
              <p className="mt-3 max-w-md text-base leading-7 text-[#5A3827]">Their visit is collected on their phone after the code is verified.</p>
              <div className={`mt-8 w-full max-w-[360px] border-2 bg-white p-5 transition-colors duration-200 sm:p-6 ${isExpiringSoon ? "border-[#B64A3B]" : "border-[#211813]"}`}>
                <QRCodeSVG value={DEMO_QR_TOKEN} size={320} level="M" includeMargin className="h-auto w-full" title="Pak Inchik loyalty demo QR code" />
              </div>
              <div className="mt-6 flex w-full max-w-[360px] items-center gap-3 border-t border-[#5A3827]/15 pt-5">
                <Clock3 className={`size-5 shrink-0 ${isExpiringSoon ? "text-[#B64A3B]" : "text-[#5A3827]"}`} aria-hidden="true" />
                <p className="flex-1 text-left text-sm text-[#5A3827]">Display refreshes in <span className="ml-2 font-mono font-bold tabular-nums text-[#211813]">00:{secondsRemaining.toString().padStart(2, "0")}</span></p>
                <Button type="button" variant="outline" onClick={refreshCode} className="h-9 rounded-lg border-[#5A3827]/25 bg-white px-3 text-[#5A3827] hover:bg-[#FFF7EA]"><RefreshCw className="size-4" aria-hidden="true" />Refresh</Button>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#5A3827]/70">Demo display: the QR value stays fixed for camera testing.</p>
            </div>
          </section>

          <aside className="border-t border-[#5A3827]/15 bg-[#F8E9CB] px-5 py-7 lg:border-l lg:border-t-0 lg:px-6">
            <div className="border-b border-dashed border-[#5A3827]/30 pb-5"><p className="text-sm font-semibold text-[#5A3827]">Today&apos;s scans</p><p className="mt-1 text-4xl font-black tracking-tight">42</p></div>
            <ol className="mt-6 space-y-5" aria-label="Shift activity">
              {shiftLog.map((entry, index) => (
                <li key={`${entry.time}-${entry.title}-${index}`} className={`border-l-2 pl-4 ${entryTone[entry.tone]}`}>
                  <time className="font-mono text-xs text-[#5A3827]/70">{entry.time}</time>
                  <p className="mt-1 text-sm font-bold text-[#211813]">{entry.title}</p>
                  <p className="mt-1 text-sm leading-5 text-[#5A3827]">{entry.detail}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex items-start gap-3 border-t border-dashed border-[#5A3827]/30 pt-5 text-sm leading-6 text-[#5A3827]"><Check className="mt-1 size-4 shrink-0 text-[#9FBC8F]" aria-hidden="true" /><p>The customer preview accepts the code displayed here.</p></div>
          </aside>
        </div>
      </section>
    </main>
  );
}
