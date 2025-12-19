"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/components/game-state-provider";
import { QUESTIONS_BY_ID } from "@/content/questions";

export default function PlayPage() {
  const router = useRouter();
  const { state, ready, answerQuestion } = useGameState();
  const [customAnswer, setCustomAnswer] = useState("");

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

  return (
    <main className="min-h-screen px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-black/50 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-amber-200/80">
          <span>Question {currentIndex + 1} / 5</span>
          <span>{state.name}</span>
        </div>

        <h2 className="mt-6 text-3xl sm:text-4xl font-semibold font-[var(--font-heading)] text-amber-50">
          {currentQuestion.prompt}
        </h2>

        <div className="mt-6 grid gap-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-base text-white/90 transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-sm uppercase tracking-[0.25em] text-white/60">
            Or type your own
          </p>
          <textarea
            value={customAnswer}
            onChange={(event) => setCustomAnswer(event.target.value)}
            rows={3}
            className="mt-3 w-full resize-none rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/30"
            placeholder="Your chaotic holiday confession..."
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            disabled={!customAnswer.trim()}
            className="mt-4 w-full rounded-2xl bg-emerald-300 px-6 py-4 text-lg font-semibold text-black shadow-[0_15px_30px_rgba(66,200,140,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit Answer
          </button>
        </div>
      </div>
    </main>
  );
}
