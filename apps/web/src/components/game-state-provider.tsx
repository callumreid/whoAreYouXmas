"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { GameState, XmasAnswer } from "@/types/game";
import { QUESTIONS } from "@/content/questions";

const STORAGE_KEY = "whoAreYouXmasState";
const QUESTIONS_PER_GAME = 5;

type GameStateContextValue = {
  state: GameState | null;
  ready: boolean;
  startGame: (name: string) => void;
  answerQuestion: (answer: XmasAnswer) => void;
  undoLastAnswer: () => void;
  resetGame: () => void;
};

const GameStateContext = createContext<GameStateContextValue | undefined>(
  undefined,
);

const pickRandomQuestionIds = () => {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUESTIONS_PER_GAME).map((question) => question.id);
};

const isValidState = (value: unknown): value is GameState => {
  if (!value || typeof value !== "object") return false;
  const state = value as GameState;
  return (
    typeof state.name === "string" &&
    Array.isArray(state.questionIds) &&
    Array.isArray(state.answers)
  );
};

export function GameStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (isValidState(parsed)) {
          setState(parsed);
        }
      } catch {
        setState(null);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (state) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [ready, state]);

  const startGame = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState({
      name: trimmed,
      questionIds: pickRandomQuestionIds(),
      answers: [],
    });
  }, []);

  const answerQuestion = useCallback(
    (answer: XmasAnswer) => {
      setState((prev) => {
        if (!prev) return prev;
        const filtered = prev.answers.filter(
          (existing) => existing.questionId !== answer.questionId,
        );
        return {
          ...prev,
          answers: [...filtered, answer],
        };
      });
    },
    [setState],
  );

  const undoLastAnswer = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.answers.length === 0) return prev;
      return {
        ...prev,
        answers: prev.answers.slice(0, -1),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(null);
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      startGame,
      answerQuestion,
      undoLastAnswer,
      resetGame,
    }),
    [state, ready, startGame, answerQuestion, undoLastAnswer, resetGame],
  );

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within GameStateProvider");
  }
  return context;
}
