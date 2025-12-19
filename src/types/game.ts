export type XmasQuestion = {
  id: string;
  prompt: string;
  options: [string, string, string];
};

export type XmasAnswer = {
  questionId: string;
  selectedOptionText?: string;
  customText?: string;
};

export type GameState = {
  name: string;
  questionIds: string[];
  answers: XmasAnswer[];
};

export type RevealResult = {
  characterName: string;
  revealText: string;
  tagline?: string;
};
