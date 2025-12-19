"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/components/game-state-provider";

export default function HomePage() {
  const router = useRouter();
  const { startGame } = useGameState();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter your name to unlock your festive fate.");
      return;
    }
    startGame(trimmed);
    router.push("/play");
  };

  return (
    <main className="min-h-screen px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-black/50 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">
          Holiday Personality Investigation
        </p>
        <h1 className="mt-4 text-5xl sm:text-6xl font-semibold font-[var(--font-heading)] text-amber-50">
          whoAreYouXmas
        </h1>
        <p className="mt-4 text-base sm:text-lg text-white/80">
          Answer five chaotic questions, then brace for your festive destiny.
        </p>

        <div className="mt-8">
          <label className="text-sm uppercase tracking-[0.2em] text-white/60">
            Enter your name
          </label>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
            className="mt-2 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-lg text-white placeholder:text-white/30"
            placeholder="The chosen one"
            aria-label="Enter your name"
          />
          {error ? (
            <p className="mt-2 text-sm text-red-300">{error}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="mt-8 w-full rounded-2xl bg-amber-300 px-6 py-4 text-lg font-semibold text-black shadow-[0_15px_30px_rgba(241,200,109,0.25)] transition hover:-translate-y-0.5"
        >
          Start
        </button>

        <p className="mt-6 text-xs text-white/50">
          Dark-ish humor, zero slow loading, 100% Christmas chaos.
        </p>
      </div>
    </main>
  );
}
