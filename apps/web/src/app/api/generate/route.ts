import { NextResponse } from "next/server";
import { CHARACTERS } from "@/content/characters";
import type { RevealResult, XmasAnswer } from "@/types/game";
import { getFallbackResult } from "@/lib/fallback";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

// Track recent character selections to ensure balanced distribution
// This is in-memory, so it resets on server restart, but helps prevent repetition
const RECENT_SELECTIONS: string[] = [];
const MAX_RECENT_TRACK = 20; // Track last 20 selections
const MAX_REPEATS_IN_WINDOW = 2; // Max 2 occurrences in recent window

// Hash function for deterministic selection
const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Get characters that haven't been overused recently
const getAvailableCharacters = (): string[] => {
  const counts = new Map<string, number>();
  
  // Count occurrences in recent selections
  for (const char of RECENT_SELECTIONS) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }
  
  // Return characters that haven't exceeded the limit
  return CHARACTERS.filter(char => (counts.get(char) || 0) < MAX_REPEATS_IN_WINDOW);
};

// Record a character selection
const recordSelection = (characterName: string) => {
  RECENT_SELECTIONS.push(characterName);
  if (RECENT_SELECTIONS.length > MAX_RECENT_TRACK) {
    RECENT_SELECTIONS.shift(); // Remove oldest
  }
};

// Select a balanced character deterministically from available options
const selectBalancedCharacter = (seed: string, availableChars: string[]): string => {
  if (availableChars.length === 0) {
    // If all characters are overused, reset and use all
    return CHARACTERS[hashString(seed) % CHARACTERS.length] ?? CHARACTERS[0];
  }
  const hash = hashString(seed);
  return availableChars[hash % availableChars.length] ?? availableChars[0];
};

// Character personality profiles for better matching
const CHARACTER_PROFILES = `
CHARACTER PERSONALITY PROFILES (use these to match):

- Santy Claus (OG): Traditional, wholesome, organized, classic choices, reliable
- Smelly Mall Santa: Cynical, burnt out, seen it all, practical, slightly defeated
- Rudolph (before the other reindeer came around): Outcast, misunderstood, lonely, pre-redemption arc
- Boring Flightless Reindeer: Unremarkable, blends in, plays it safe, no plot twists
- The Grinch (early movie): Bitter, antisocial, actively dislikes Christmas, isolationist
- The Grinch (late movie): Reformed, heart grown, optimistic, found the true meaning
- Krampus: Dark humor, punisher, chaos energy, slightly menacing
- Frosty the Snowman: Jolly, innocent, childlike wonder, ephemeral joy
- Charlie Brown: Melancholic, trying their best, things go wrong, existential
- Polar Bear (laid of by Coke): Unemployed, betrayed by capitalism, cynical about commercialism
- Orphan From a Christmas Movie: Plucky, resilient, believes in magic, underdog
- Blow-Up Inflatable Santa: Artificial, flashy, all show no substance, desperately festive
- Over-Served Uncle (melancholic): Drunk and sad, nostalgic, emotional vulnerability
- Over-Served Uncle (boisterous): Drunk and loud, center of attention, no filter
- Baby Jesus: Sacred, peaceful, pure, spiritually centered
- Elf Union Organizer: Political, fights for workers, organized, rebellious with purpose
- Xmas Tree on the Roof of the Car: Chaotic, barely holding together, making it work somehow
- Adult Caroler: Enthusiastic, traditional participant, community-oriented, sincere
- Even Tinier Tim: Extra vulnerable, needs help, sympathetic, small presence
- (not so) Tiny Tim (took HGH and hit the gym): Overcorrected, buff redemption, surprising twist
- The Rat Under Santa's Hat Controlling Santa: Manipulator, puppet master, hidden control
- The Christmas Roast: Gets roasted, target of jokes, good sport about it
- Max The Grinch's Dog: Loyal despite abuse, puts up with nonsense, sympathetic sidekick
- A Who from Whoville (non-speaking part): Background character, unnoticed, ensemble player
- The Ghost of a Chimney Sweep: Haunted, dark past, Victorian vibes, tragic
- Surfing Santy Claws: Chill, California vibes, unconventional, goes with the flow
- Santy Claws (crab Santa): Sideways approach, pinchy, beach creature energy
- Santy Paws (dog Santa): Loyal, energetic, wants treats, man's best friend
- Santy Jaws (shark Santa): Predatory, scary, unexpected danger, teeth
- Skanky Claus (freaky-deeky Santa): Sexual energy, inappropriate, boundary-pushing
- Banky Claus (rich business Santa): Capitalist, wealthy, corporate, material success
- Kevin McCallister (from home alone): Resourceful, clever traps, chaos architect, home defender
- Buzz McCallister (from home alone): Bully, antagonist, mean older sibling
- the Bad Mother from home alone: Guilt-ridden, frantic, realizes mistakes too late
- runaway polar express: Out of control, dangerous, thrilling, off the rails
`;

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

    // Get characters that are available (not overused recently)
    const availableCharacters = getAvailableCharacters();
    const overusedCharacters = CHARACTERS.filter(char => !availableCharacters.includes(char));
    
    // Create a seed from answers for deterministic fallback
    const answerSeed = body.name + body.answers.map(a => a.selectedOptionText || a.customText || '').join('|');

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 1.2, // Increased for more variety
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert personality psychologist specializing in Christmas archetypes. Your job is to deeply analyze quiz responses, identify personality patterns, and match people to the character that BEST fits their psychological profile. Consider: chaos tolerance, humor style (dark vs wholesome), traditionalism vs rebellion, social behavior, emotional state, and life philosophy. BE SPECIFIC and VARIED in your matches - different answer patterns should lead to different characters.",
          },
          {
            role: "user",
            content: `Perform a deep psychological analysis of this person's quiz responses:

USER: ${body.name} (Use their name as context for personality interpretation)
ANALYSIS SESSION: ${Date.now()} (Ensure fresh analysis, not cached response)

THEIR COMPLETE ANSWER PROFILE:
${body.answers.map((a, i) => `Q${i + 1}: "${body.questions[i].prompt}"
   → Selected: "${a.selectedOptionText || 'No answer'}"${a.customText ? `
   → Custom response: "${a.customText}"` : ''}`).join('\n\n')}

${CHARACTER_PROFILES}

${overusedCharacters.length > 0 ? `\nIMPORTANT: The following characters have been used too frequently recently and should be AVOIDED unless they are an absolutely perfect match:
${overusedCharacters.map(char => `- ${char}`).join('\n')}

Please select from the remaining characters to ensure variety.` : ''}

ANALYSIS INSTRUCTIONS:
1. PSYCHOLOGICAL PATTERN ANALYSIS:
   - What's their chaos tolerance? (organized vs chaotic)
   - Humor style? (dark/cynical vs wholesome/innocent)  
   - Social approach? (isolated/antisocial vs community-oriented)
   - Attitude toward tradition? (classic vs rebellious)
   - Emotional state? (melancholic vs enthusiastic vs neutral)
   - Self-awareness level? (self-deprecating vs confident vs oblivious)

2. MATCH TO ONE CHARACTER:
   - Look at the CHARACTER PROFILES above
   - Find the character whose traits align MOST with their pattern
   - ${overusedCharacters.length > 0 ? 'CRITICAL: Avoid the overused characters listed above. ' : ''}Vary your selections - avoid repeating the same character
   - If answers are similar but not identical, find nuanced differences
   - Consider the whole answer pattern, not just one answer
   - Even small differences in choices should lead to different characters
   - ${availableCharacters.length < CHARACTERS.length ? `Prefer selecting from characters that haven't been overused recently to ensure balanced distribution.` : ''}

3. WRITE PERSONALIZED REVEAL (3-5 sentences):
   - Reference AT LEAST 2 specific choices they made
   - Explain the psychological insight ("You chose X because you're Y type")
   - Connect it to the character's essence
   - Make it feel like a real personality test result
   - Be funny but also genuinely insightful

4. TAGLINE (optional): A punchy phrase that captures their vibe

Return ONLY JSON: 
{
  "characterName": "exact character name from list",
  "revealText": "personalized psychological analysis referencing their specific choices",
  "tagline": "optional punchy phrase"
}`,
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

    // Check if the AI-selected character has been overused
    const recentCount = RECENT_SELECTIONS.filter(char => char === parsed.characterName).length;
    let finalCharacter = parsed.characterName;
    let finalRevealText = parsed.revealText;
    let finalTagline = parsed.tagline;

    if (recentCount >= MAX_REPEATS_IN_WINDOW) {
      // Character is overused, use balanced selection instead
      const balancedChar = selectBalancedCharacter(answerSeed, availableCharacters);
      console.log(`[API] AI selected overused character "${parsed.characterName}" (used ${recentCount} times recently). Using balanced selection: "${balancedChar}"`);
      
      finalCharacter = balancedChar;
      
      // Get appropriate reveal text for the substituted character
      // Make a quick AI call to get character-appropriate text
      try {
        const revealResponse = await fetch(OPENAI_URL, {
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
                content: "You write personalized, funny personality test results for Christmas characters. Be insightful and reference specific quiz answers.",
              },
              {
                role: "user",
                content: `Write a personalized reveal (3-5 sentences) for "${balancedChar}" based on these quiz answers:
${body.answers.map((a, i) => `Q${i + 1}: "${body.questions[i].prompt}" → "${a.selectedOptionText || a.customText || 'No answer'}"`).join('\n')}

Reference at least 2 specific choices. Return JSON: {"revealText": "...", "tagline": "optional phrase"}`,
              },
            ],
          }),
        });

        if (revealResponse.ok) {
          const revealData = await revealResponse.json();
          const revealContent = revealData?.choices?.[0]?.message?.content ?? "";
          const revealParsed = extractJson(revealContent);
          if (revealParsed?.revealText) {
            finalRevealText = revealParsed.revealText;
            if (revealParsed.tagline) {
              finalTagline = revealParsed.tagline;
            }
          }
        }
      } catch (revealError) {
        // If reveal text generation fails, keep the original AI text
        console.log(`[API] Could not generate reveal text for substituted character, using original`);
      }
    } else {
      console.log(`[API] AI selection "${parsed.characterName}" is acceptable (used ${recentCount} times recently)`);
    }

    // Record the final selection
    recordSelection(finalCharacter);

    console.log(`[API] Success: Matched ${body.name} to ${finalCharacter}`);

    return NextResponse.json({
      characterName: finalCharacter,
      revealText: finalRevealText,
      tagline: finalTagline,
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
