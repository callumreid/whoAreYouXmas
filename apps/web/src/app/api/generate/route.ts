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

    if (!apiKey) {
      console.error("[API] OPENAI_API_KEY not configured");
      return NextResponse.json(getFallbackResult(fallbackSeed));
    }
    
    if (!body?.name || !body?.questions?.length) {
      console.error("[API] Invalid request body");
      return NextResponse.json(getFallbackResult(fallbackSeed));
    }

    console.log(`[API] Analyzing ${body.name} with ${body.answers.length} answers`);

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert Christmas personality analyst. Analyze the user's quiz answers deeply to understand their personality traits, humor style, chaos tolerance, and holiday spirit. Match them to the most fitting character based on psychological patterns, not random assignment.",
          },
          {
            role: "user",
            content: `Analyze this person's quiz responses and match them to ONE character that best fits their personality:

USER: ${body.name}

THEIR ANSWERS:
${body.answers.map((a, i) => `Q${i + 1}: "${body.questions[i].prompt}"
   → Chose: "${a.selectedOptionText || 'No answer'}"${a.customText ? ` (Note: ${a.customText})` : ''}`).join('\n\n')}

AVAILABLE CHARACTERS:
${CHARACTERS.join(', ')}

INSTRUCTIONS:
1. Analyze patterns in their choices: Are they chaotic or organized? Dark-humored or wholesome? Rebellious or traditional?
2. Look at their custom notes (if provided) for deeper insight
3. Match them to the ONE character whose personality and energy most aligns with their answers
4. Write a reveal text (3-5 sentences) that:
   - References specific choices they made
   - Explains WHY this character fits them
   - Is funny, insightful, and slightly dark but family-friendly
   - Feels personal, not generic
5. Optional: Add a punchy tagline that captures their vibe

Return JSON: { "characterName": "exact character name from list", "revealText": "personalized analysis", "tagline": "optional punchy phrase" }`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] OpenAI error ${response.status}:`, errorText);
      return NextResponse.json(getFallbackResult(body.name));
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content);

    if (!isValidResult(parsed)) {
      console.error("[API] Invalid AI response format");
      return NextResponse.json(getFallbackResult(body.name));
    }

    if (!CHARACTERS.includes(parsed.characterName)) {
      console.error(`[API] AI returned invalid character: ${parsed.characterName}`);
      return NextResponse.json(getFallbackResult(body.name));
    }

    console.log(`[API] Success: Matched ${body.name} to ${parsed.characterName}`);

    return NextResponse.json({
      characterName: parsed.characterName,
      revealText: parsed.revealText,
      tagline: parsed.tagline,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("[API] Exception:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(getFallbackResult(fallbackSeed), {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
