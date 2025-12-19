"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/components/game-state-provider";
import { QUESTIONS_BY_ID } from "@/content/questions";
import { LOADING_PHRASES } from "@/content/loadingPhrases";
import type { RevealResult } from "@/types/game";
import { getFallbackResult } from "@/lib/fallback";
import { getCharacterImage } from "@/content/characters";

const MIN_LOADING_MS = 2200;

export default function RevealPage() {
  const router = useRouter();
  const { state, ready, resetGame } = useGameState();
  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  const [result, setResult] = useState<RevealResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const playAgainRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase === "reveal" && result) {
      const timer = setTimeout(() => {
        playAgainRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [phase, result]);

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/api/generate`, {
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
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="peanuts-card w-full max-w-xl p-10 text-center relative overflow-hidden">
          {/* Charlie Brown Zig-Zag Decorative element */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[#1a1a1a]" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>

          <p className="text-xs uppercase tracking-[0.35em] text-red-600 font-bold">
            Scanning Holiday Alignment
          </p>
          <h2 className="mt-4 text-4xl font-bold font-[var(--font-heading)] text-[#1a1a1a]">
            {LOADING_PHRASES[phraseIndex]}
          </h2>
          <div className="mt-8 h-6 w-full border-4 border-[#1a1a1a] bg-white overflow-hidden p-1">
            <div
              className="h-full bg-[#f4c542] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-gray-500 font-bold">{progress}% complete</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="relative z-10 min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-bold">Summoning your result...</p>
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="peanuts-card w-full max-w-3xl p-10 relative overflow-hidden">
        {/* Charlie Brown Zig-Zag Decorative element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#1a1a1a]" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>

        <p className="text-xs uppercase tracking-[0.35em] text-red-600 font-bold">
          Festive Fate Unlocked
        </p>
        <div className="mt-6 flex justify-center">
          <img
            src={getCharacterImage(result.characterName)}
            alt={result.characterName}
            className="w-full max-w-2xl border-4 border-[#1a1a1a] shadow-[6px_6px_0px_#1a1a1a]"
            loading="eager"
          />
        </div>
        <h1 className="mt-4 text-5xl sm:text-6xl font-bold font-[var(--font-heading)] text-[#1a1a1a]">
          YOU ARE: {result.characterName}
        </h1>
        {result.tagline ? (
          <p className="mt-3 text-xl text-green-700 font-bold italic underline decoration-4 decoration-[#1a1a1a] underline-offset-4">{result.tagline}</p>
        ) : null}
        <p className="mt-8 text-xl leading-relaxed text-[#1a1a1a] font-medium border-l-8 border-[#f4c542] pl-6 py-2">
          {result.revealText}
        </p>
        <button
          ref={playAgainRef}
          type="button"
          onClick={() => {
            resetGame();
            router.push("/");
          }}
          className="mt-10 w-full border-4 border-[#1a1a1a] bg-[#d63b3b] px-6 py-4 text-xl font-bold text-white shadow-[6px_6px_0px_#1a1a1a] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
