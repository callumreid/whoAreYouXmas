"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/components/game-state-provider";
import { QUESTIONS_BY_ID } from "@/content/questions";
import { LOADING_PHRASES } from "@/content/loadingPhrases";
import type { RevealResult } from "@/types/game";
import { getFallbackResult } from "@/lib/fallback";

const MIN_LOADING_MS = 2200;

export default function RevealPage() {
  const router = useRouter();
  const { state, ready, resetGame } = useGameState();
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  const [result, setResult] = useState<RevealResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const payload = useMemo(() => {
    if (!state) return null;
    return {
      name: state.name,
      questions: state.questionIds
        .map((id) => QUESTIONS_BY_ID.get(id))
        .filter(Boolean)
        .map((question) => ({
          prompt: question!.prompt,
          options: question!.options,
        })),
      answers: state.answers,
    };
  }, [state]);

  useEffect(() => {
    if (!ready) return;
    if (!state || state.answers.length < 5) {
      router.replace("/");
    }
  }, [ready, state, router]);

  useEffect(() => {
    if (!payload) return;
    let active = true;
    const controller = new AbortController();
    const start = Date.now();
    const minDelay = MIN_LOADING_MS + Math.floor(Math.random() * 1200);

    const run = async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const data = (await response.json()) as RevealResult;
        const elapsed = Date.now() - start;
        const wait = Math.max(0, minDelay - elapsed);
        if (wait) {
          await new Promise((resolve) => setTimeout(resolve, wait));
        }
        if (!active) return;
        setResult(data);
        setProgress(100);
        setPhase("reveal");
      } catch {
        if (!active) return;
        const fallback = getFallbackResult(
          `${state?.name ?? "guest"}${JSON.stringify(state?.answers ?? [])}`,
        );
        setResult(fallback);
        setProgress(100);
        setPhase("reveal");
      }
    };

    run();

    return () => {
      active = false;
      controller.abort();
    };
  }, [payload, state]);

  useEffect(() => {
    if (phase !== "loading") return undefined;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(94, Math.round((elapsed / (MIN_LOADING_MS + 1200)) * 100));
      setProgress((prev) => (prev > pct ? prev : pct));
    }, 80);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "loading") return undefined;
    const id = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 520);
    return () => clearInterval(id);
  }, [phase]);

  if (phase === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-black/50 p-8 text-center shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
            Scanning Holiday Alignment
          </p>
          <h2 className="mt-4 text-4xl font-semibold font-[var(--font-heading)] text-amber-50">
            {LOADING_PHRASES[phraseIndex]}
          </h2>
          <div className="mt-8 h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-red-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-white/60">{progress}% complete</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/70">Summoning your result...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-black/50 p-10 shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
          Festive Fate Unlocked
        </p>
        <h1 className="mt-4 text-5xl sm:text-6xl font-semibold font-[var(--font-heading)] text-amber-50">
          YOU ARE: {result.characterName}
        </h1>
        {result.tagline ? (
          <p className="mt-3 text-lg text-amber-200/90">{result.tagline}</p>
        ) : null}
        <p className="mt-6 text-lg leading-relaxed text-white/85">
          {result.revealText}
        </p>
        <button
          type="button"
          onClick={() => {
            resetGame();
            router.push("/");
          }}
          className="mt-8 w-full rounded-2xl bg-red-400 px-6 py-4 text-lg font-semibold text-black shadow-[0_15px_30px_rgba(214,59,59,0.25)] transition hover:-translate-y-0.5"
        >
          Play Again
        </button>
      </div>
    </main>
  );
}
