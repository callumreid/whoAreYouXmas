"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/components/game-state-provider";
import { useTvMode } from "@/components/tv-mode-provider";

// D-pad-friendly preset names for TV mode (no on-screen keyboard on Fire TV)
const TV_PRESET_NAMES = [
  "Cousin Blitzen",
  "Li'l Nog",
  "Tinsel Tony",
  "Gravy Judy",
  "Krampus Jr.",
  "Fig E. Pudding",
  "Mall Santa Steve",
  "Aunt Mistletoe",
];

const PLAYER_ONE_LABEL = "Just call me Player One";
const PLAYER_ONE_NAME = "Player One";
const PRESET_GRID_COLS = 2;

export default function HomePage() {
  const router = useRouter();
  const { startGame } = useGameState();
  const tvMode = useTvMode();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const presetRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // Small delay to ensure browser focus works correctly on TV
    const timer = setTimeout(() => {
      if (tvMode) {
        presetRefs.current[0]?.focus();
      } else {
        inputRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [tvMode]);

  // D-pad navigation across the preset grid (TV mode only)
  useEffect(() => {
    if (!tvMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      if (!arrows.includes(event.key)) return;

      const buttons = presetRefs.current.filter(
        (button): button is HTMLButtonElement => Boolean(button),
      );
      if (buttons.length === 0) return;
      event.preventDefault();

      const lastIndex = buttons.length - 1; // full-width "Player One" row
      const activeIndex = buttons.findIndex(
        (button) => button === document.activeElement,
      );
      if (activeIndex < 0) {
        buttons[0]?.focus();
        return;
      }

      let nextIndex = activeIndex;
      switch (event.key) {
        case "ArrowDown":
          nextIndex = Math.min(activeIndex + PRESET_GRID_COLS, lastIndex);
          break;
        case "ArrowUp":
          nextIndex =
            activeIndex === lastIndex
              ? lastIndex - PRESET_GRID_COLS + 1
              : Math.max(activeIndex - PRESET_GRID_COLS, activeIndex % PRESET_GRID_COLS);
          break;
        case "ArrowRight":
          if (activeIndex % PRESET_GRID_COLS === 0 && activeIndex < lastIndex) {
            nextIndex = activeIndex + 1;
          }
          break;
        case "ArrowLeft":
          if (activeIndex % PRESET_GRID_COLS === 1) {
            nextIndex = activeIndex - 1;
          }
          break;
      }
      buttons[nextIndex]?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tvMode]);

  const beginGame = (chosenName: string) => {
    const trimmed = chosenName.trim();
    if (!trimmed) {
      setError("Enter your name to unlock your festive fate.");
      return;
    }
    startGame(trimmed);
    router.push("/play");
  };

  const handleStart = () => beginGame(name);

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

        {tvMode ? (
          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 font-bold text-center">
              Pick your name
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {TV_PRESET_NAMES.map((presetName, index) => (
                <button
                  key={presetName}
                  ref={(el) => {
                    presetRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => beginGame(presetName)}
                  className="border-4 border-[#1a1a1a] bg-white px-3 py-3 text-base font-bold text-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] transition-all focus:bg-[#b3d9ff]"
                >
                  {presetName}
                </button>
              ))}
              <button
                ref={(el) => {
                  presetRefs.current[TV_PRESET_NAMES.length] = el;
                }}
                type="button"
                onClick={() => beginGame(PLAYER_ONE_NAME)}
                className="col-span-2 border-4 border-[#1a1a1a] bg-[#f4c542] px-3 py-3 text-base font-bold text-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] transition-all focus:bg-[#b3d9ff]"
              >
                {PLAYER_ONE_LABEL}
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Use the remote to pick a name, then press select to start.
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}

        <p className="mt-6 text-sm text-gray-500 italic text-center">
          "I think there must be something wrong with me, Linus. I just don't understand Christmas."
        </p>
      </div>
    </main>
  );
}
