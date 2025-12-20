"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/components/game-state-provider";
import { QUESTIONS_BY_ID } from "@/content/questions";

export default function PlayPage() {
  const router = useRouter();
  const { state, ready, answerQuestion, undoLastAnswer } = useGameState();
  const [customAnswer, setCustomAnswer] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const firstOptionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ready) return;
    if (!state?.name || state.questionIds.length === 0) {
      router.replace("/");
    }
  }, [ready, state, router]);

  useEffect(() => {
    if (!ready) return;
    if (state && state.answers.length >= 5) {
      router.replace("/reveal");
    }
  }, [ready, state, router]);

  const currentIndex = state?.answers.length ?? 0;

  const currentQuestion = useMemo(() => {
    if (!state) return null;
    const questionId = state.questionIds[currentIndex];
    return questionId ? QUESTIONS_BY_ID.get(questionId) ?? null : null;
  }, [state, currentIndex]);

  // Preload image when question changes
  useEffect(() => {
    if (!currentQuestion?.imagePrompt) {
      setImageLoaded(true);
      return;
    }
    
    setImageLoaded(false);
    const img = new Image();
    img.src = `/questions/${currentQuestion.id}/1.png`;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true); // Show question even if image fails
  }, [currentQuestion?.id]);

  // Auto-focus first option when question changes
  useEffect(() => {
    if (ready && currentQuestion) {
      // Small delay to ensure DOM is ready and focus transition is smooth
      const timer = setTimeout(() => {
        firstOptionRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, ready]);

  // Handle back button for TV/Web
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Backspace") {
        // Only handle Backspace if not in a textarea/input
        if (
          e.key === "Backspace" &&
          (document.activeElement?.tagName === "INPUT" ||
            document.activeElement?.tagName === "TEXTAREA")
        ) {
          return;
        }

        if (currentIndex > 0) {
          e.preventDefault();
          undoLastAnswer();
        } else {
          // On first question, maybe go back to home
          e.preventDefault();
          router.push("/");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, undoLastAnswer, router]);


  const handleSelect = (option: string) => {
    if (!currentQuestion) return;
    answerQuestion({
      questionId: currentQuestion.id,
      selectedOptionText: option,
    });
    setCustomAnswer("");
    if ((state?.answers.length ?? 0) + 1 >= 5) {
      router.push("/reveal");
    }
  };

  const handleCustomSubmit = () => {
    const trimmed = customAnswer.trim();
    if (!trimmed || !currentQuestion) return;
    answerQuestion({
      questionId: currentQuestion.id,
      customText: trimmed,
    });
    setCustomAnswer("");
    if ((state?.answers.length ?? 0) + 1 >= 5) {
      router.push("/reveal");
    }
  };

  if (!ready || !state || !currentQuestion) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-white/70">Loading festive chaos...</p>
      </main>
    );
  }

  // Show loading state while image is loading
  if (currentQuestion.imagePrompt && !imageLoaded) {
    return (
      <main className="relative z-10 min-h-screen px-4 py-10 flex items-center justify-center">
        <div className="peanuts-card p-8 text-center">
          <div className="inline-block animate-spin text-4xl mb-4">🎄</div>
          <p className="text-[#1a1a1a] font-bold">Loading question image...</p>
        </div>
      </main>
    );
  }

  const hasImage = !!currentQuestion.imagePrompt;
  const imagePath = `/questions/${currentQuestion.id}/1.png`;
  const isImageLeft = currentQuestion.imageSide === "left";

  return (
    <main className="relative z-10 min-h-screen px-4 py-10 flex items-center justify-center">
      <div 
        className={`w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-stretch ${
          hasImage && isImageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
        }`}
      >
        {/* Image Section */}
        {hasImage && (
          <div className="flex-1 peanuts-card p-4 flex items-center justify-center bg-white border-4 border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a]">
            <img
              src={imagePath}
              alt="Holiday context"
              className="w-full h-auto max-h-[60vh] object-contain border-2 border-[#1a1a1a]"
              onError={(e) => {
                // Hide the image if it doesn't exist yet
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Question Card */}
        <div className={`peanuts-card w-full ${hasImage ? "lg:w-[500px]" : "max-w-2xl"} p-8 relative overflow-hidden flex-shrink-0`}>
          {/* Charlie Brown Zig-Zag Decorative element */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[#1a1a1a]" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>

          <div className="flex items-center justify-center text-xs uppercase tracking-[0.3em] text-red-600 font-bold">
            <span>Question {currentIndex + 1} / 5</span>
          </div>

          <h2 className="mt-6 text-2xl sm:text-3xl font-bold font-[var(--font-heading)] text-[#1a1a1a] leading-tight">
            {currentQuestion.prompt}
          </h2>

          <div className="mt-6 grid gap-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option}
                ref={index === 0 ? firstOptionRef : null}
                type="button"
                onClick={() => handleSelect(option)}
                className="w-full border-4 border-[#1a1a1a] bg-white px-4 py-3 text-left text-base sm:text-lg font-bold text-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus:bg-[#b3d9ff]"
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-8 border-t-4 border-[#1a1a1a] pt-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500 font-bold">
              Or type your own
            </p>
            <textarea
              value={customAnswer}
              onChange={(event) => setCustomAnswer(event.target.value)}
              rows={2}
              className="mt-2 w-full resize-none border-4 border-[#1a1a1a] bg-white px-3 py-2 text-base text-[#1a1a1a] placeholder:text-gray-300 focus:outline-none"
              placeholder="Your chaotic holiday confession..."
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              disabled={!customAnswer.trim()}
              className="mt-3 w-full border-4 border-[#1a1a1a] bg-[#2d5a27] px-4 py-3 text-lg font-bold text-white shadow-[4px_4px_0px_#1a1a1a] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-30 disabled:translate-0 disabled:shadow-[4px_4px_0px_#1a1a1a]"
            >
              Submit Answer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
