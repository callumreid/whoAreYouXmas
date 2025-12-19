import { CHARACTERS } from "@/content/characters";
import type { RevealResult } from "@/types/game";

const cannedLines = [
  "You radiate festive chaos with a hint of menace.",
  "Your vibe says: jingle hard, sleep later.",
  "People are not sure if you’re a gift or a warning.",
  "You show up late, but you always bring the plot twist.",
  "Holiday cheer follows you, slightly out of breath.",
];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getFallbackResult = (seed: string): RevealResult => {
  const hash = hashString(seed);
  const characterName = CHARACTERS[hash % CHARACTERS.length] ?? CHARACTERS[0];
  const revealText = cannedLines
    .slice(0, 3 + (hash % 3))
    .join(" ");
  return { characterName, revealText };
};
