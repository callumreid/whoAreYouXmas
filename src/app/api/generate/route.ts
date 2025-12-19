import { NextResponse } from "next/server";
import { CHARACTERS } from "@/content/characters";
import type { RevealResult, XmasAnswer } from "@/types/game";
import { getFallbackResult } from "@/lib/fallback";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

type GenerateBody = {
  name: string;
  questions: { prompt: string; options: [string, string, string] }[];
  answers: XmasAnswer[];
};

const extractJson = (content: string) => {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(content.slice(start, end + 1));
  } catch {
    return null;
  }
};

const isValidResult = (value: any): value is RevealResult => {
  return (
    value &&
    typeof value.characterName === "string" &&
    typeof value.revealText === "string"
  );
};

export async function POST(request: Request) {
  const fallbackSeed = Math.random().toString(36).slice(2);
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const body = (await request.json()) as GenerateBody;

    if (!apiKey || !body?.name || !body?.questions?.length) {
      return NextResponse.json(getFallbackResult(fallbackSeed));
    }

    const prompt = {
      name: body.name,
      characters: CHARACTERS,
      questions: body.questions,
      answers: body.answers,
    };

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.9,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a Christmas personality oracle. Respond with strict JSON only.",
          },
          {
            role: "user",
            content:
              "Return JSON with: characterName (must be one of the provided characters), revealText (3-5 sentences, funny, bombastic, slightly dark but party-appropriate), optional tagline. No markdown, no extra keys. Here is the data: " +
              JSON.stringify(prompt),
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);

    if (!isValidResult(parsed)) {
      return NextResponse.json(getFallbackResult(body.name));
    }

    if (!CHARACTERS.includes(parsed.characterName)) {
      return NextResponse.json(getFallbackResult(body.name));
    }

    return NextResponse.json({
      characterName: parsed.characterName,
      revealText: parsed.revealText,
      tagline: parsed.tagline,
    });
  } catch {
    return NextResponse.json(getFallbackResult(fallbackSeed));
  }
}
