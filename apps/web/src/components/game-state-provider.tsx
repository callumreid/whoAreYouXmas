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
const QUESTION_HISTORY_KEY = "whoAreYouXmasQuestionHistory";
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

const shuffle = <T,>(values: T[]) => {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pickRandomQuestionIds = (history: string[]) => {
  const historySet = new Set(history);
  let available = QUESTIONS.filter((question) => !historySet.has(question.id));
  const resetHistory = available.length < QUESTIONS_PER_GAME;
  if (resetHistory) {
    available = [...QUESTIONS];
  }

  const shuffled = shuffle(available);
  const selected = shuffled.slice(0, QUESTIONS_PER_GAME).map((question) => question.id);
  const nextHistory = resetHistory ? selected : [...historySet, ...selected];
  return { selected, nextHistory };
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
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);

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
    const storedHistory = sessionStorage.getItem(QUESTION_HISTORY_KEY);
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
          setQuestionHistory(parsed);
        }
      } catch {
        setQuestionHistory([]);
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

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(QUESTION_HISTORY_KEY, JSON.stringify(questionHistory));
  }, [ready, questionHistory]);

  const startGame = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { selected, nextHistory } = pickRandomQuestionIds(questionHistory);
    setQuestionHistory(nextHistory);
    setState({
      name: trimmed,
      questionIds: selected,
      answers: [],
    });
  }, [questionHistory]);

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
