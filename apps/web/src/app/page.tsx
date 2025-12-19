"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/components/game-state-provider";

export default function HomePage() {
  const router = useRouter();
  const { startGame } = useGameState();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Small delay to ensure browser focus works correctly on TV
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
    <main className="relative z-10 min-h-screen px-4 py-12 flex items-center justify-center">
      <div className="peanuts-card w-full max-w-xl p-8 relative overflow-hidden">
        {/* Charlie Brown Zig-Zag Decorative element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#1a1a1a]" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>
        
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-red-600 font-bold">
            Holiday Personality Investigation
          </p>
          <h1 className="mt-4 text-5xl sm:text-6xl font-bold font-[var(--font-heading)] text-[#1a1a1a]">
            whoAreYouXmas
          </h1>
        </div>
        <p className="mt-4 text-lg sm:text-xl text-gray-700 text-center">
          answer 5 questions to reveal your Xmas identity!
        </p>

        <div className="mt-8">
          <label className="text-sm uppercase tracking-[0.2em] text-gray-500 font-bold">
            Enter your name
          </label>
          <input
            ref={inputRef}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
            className="mt-2 w-full border-4 border-[#1a1a1a] bg-white px-4 py-3 text-lg text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none"
            placeholder="tommy two hands"
            aria-label="Enter your name"
          />
          {error ? (
            <p className="mt-2 text-sm text-red-600 font-bold">{error}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="mt-8 w-full border-4 border-[#1a1a1a] bg-[#f4c542] px-6 py-4 text-xl font-bold text-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          Start
        </button>

        <p className="mt-6 text-sm text-gray-500 italic text-center">
          "I think there must be something wrong with me, Linus. I just don't understand Christmas."
        </p>
      </div>
    </main>
  );
}
