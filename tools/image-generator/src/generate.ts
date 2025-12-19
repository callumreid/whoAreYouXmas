import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import pLimit from "p-limit";
import slugify from "slugify";
import sharp from "sharp";
import * as charactersModule from "../../../apps/web/src/content/characters.js";

type Manifest = Record<string, string>;

type CliOptions = {
  anchorPath: string;
  outDir: string;
  size: string;
  force: boolean;
  concurrency: number;
  derived: boolean;
};

const DEFAULT_OUT_DIR = "apps/web/public/characters";
const DEFAULT_SIZE = "1024x1024";
const DEFAULT_CONCURRENCY = 3;
const DERIVED_SIZES = [512, 256];

const STYLE_LOCK = [
  "Match the provided reference image's lighting, rendering style, background bokeh, color grading, and overall realism.",
  "Single subject, centered composition, icon-readable.",
  "No text, no logos, no watermarks.",
  "Family-safe: no gore, no explicit sexual content, no hateful symbols.",
].join(" ");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseArgs = (argv: string[]): CliOptions => {
  const getValue = (flag: string) => {
    const direct = argv.find((arg) => arg.startsWith(`${flag}=`));
    if (direct) return direct.slice(flag.length + 1);
    const idx = argv.indexOf(flag);
    if (idx >= 0 && idx < argv.length - 1) return argv[idx + 1];
    return undefined;
  };

  const hasFlag = (flag: string) => argv.includes(flag);

  const anchorPath = getValue("--anchor");
  if (!anchorPath) {
    throw new Error("Missing required --anchor <path> argument.");
  }

  const outDir = getValue("--out") ?? DEFAULT_OUT_DIR;
  const size = getValue("--size") ?? DEFAULT_SIZE;
  const concurrencyRaw = getValue("--concurrency");
  const concurrency = concurrencyRaw ? Number(concurrencyRaw) : DEFAULT_CONCURRENCY;

  return {
    anchorPath,
    outDir,
    size,
    force: hasFlag("--force"),
    concurrency: Number.isFinite(concurrency) && concurrency > 0 ? concurrency : DEFAULT_CONCURRENCY,
    derived: hasFlag("--derived"),
  };
};

const validateSize = (size: string) => {
  if (!/^\d+x\d+$/.test(size)) {
    throw new Error(`Invalid --size value: ${size}. Expected format like 1024x1024.`);
  }
};

const buildPrompt = (name: string) => {
  return `${STYLE_LOCK} Character: ${name}. Make it instantly recognizable.`;
};

const toSlug = (name: string) => {
  const slug = slugify(name, { lower: true, strict: true, trim: true });
  if (!slug) {
    throw new Error(`Unable to slugify character name: ${name}`);
  }
  return slug;
};

const isRetryable = (error: any) => {
  const status = error?.status ?? error?.response?.status;
  return status === 429 || (typeof status === "number" && status >= 500);
};

const withRetries = async <T>(fn: () => Promise<T>, retries = 4) => {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (!isRetryable(error) || attempt >= retries) {
        throw error;
      }
      const delay = Math.min(8000, 800 * 2 ** attempt) + Math.floor(Math.random() * 250);
      console.warn(`Retrying after ${delay}ms (attempt ${attempt + 1}/${retries}).`);
      await sleep(delay);
      attempt += 1;
    }
  }
};

const resolveManifestPath = (outputPath: string, outDir: string) => {
  const publicRoot = path.resolve(REPO_ROOT, "apps/web/public");
  const resolvedOut = path.resolve(outDir);
  if (resolvedOut.startsWith(publicRoot)) {
    const rel = path.relative(publicRoot, outputPath).split(path.sep).join("/");
    return `/${rel}`;
  }
  return path.relative(process.cwd(), outputPath).split(path.sep).join("/");
};

const generateImage = async (client: OpenAI, prompt: string, anchorPath: string, size: string) => {
  const response = await client.images.edit({
    model: "gpt-image-1.5",
    image: fs.createReadStream(anchorPath),
    prompt,
    size: size as any,
    quality: "low",
    response_format: "b64_json",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("No image data returned from OpenAI Images API.");
  }
  return Buffer.from(b64, "base64");
};

const MAIN_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(MAIN_FILE), "../../..");

const resolveFromRepo = (value: string) => {
  if (path.isAbsolute(value)) return value;
  return path.resolve(REPO_ROOT, value);
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  validateSize(options.size);

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in environment.");
  }

  const apiKey = process.env.OPENAI_API_KEY.trim();
  if (!apiKey.startsWith("sk-")) {
    throw new Error("Invalid OPENAI_API_KEY format. It should start with 'sk-'.");
  }

  console.log(`Using API key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)} (length: ${apiKey.length})`);

  const anchorPath = resolveFromRepo(options.anchorPath);
  if (!fs.existsSync(anchorPath)) {
    throw new Error(`Anchor image not found at ${anchorPath}`);
  }

  const outDir = resolveFromRepo(options.outDir);
  await fs.promises.mkdir(outDir, { recursive: true });

  const client = new OpenAI({ apiKey });
  const limit = pLimit(Math.max(1, Math.min(options.concurrency, 4)));
  const manifest: Manifest = {};
  
  const characters: any = (charactersModule as any).default || charactersModule;
  const characterNames = characters.CHARACTER_NAMES;

  if (!characterNames || !Array.isArray(characterNames)) {
    throw new Error("Could not find CHARACTER_NAMES array. Check your imports and content/characters.ts file.");
  }

  const tasks = characterNames.map((name: string) =>
    limit(async () => {
      const slug = toSlug(name);
      const characterDir = path.join(outDir, slug);
      await fs.promises.mkdir(characterDir, { recursive: true });
      
      const outputPath = path.join(characterDir, `1.png`);
      const manifestPath = resolveManifestPath(outputPath, outDir);
      manifest[name] = manifestPath;

      if (!options.force && fs.existsSync(outputPath)) {
        console.log(`Skipping ${name} (already exists)`);
        return;
      }

      const prompt = buildPrompt(name);
      const buffer = await withRetries(() => generateImage(client, prompt, anchorPath, options.size));

      await fs.promises.writeFile(outputPath, buffer);
      console.log(`Wrote ${outputPath}`);

      if (options.derived) {
        await Promise.all(
          DERIVED_SIZES.map(async (target) => {
            const resized = await sharp(buffer)
              .resize(target, target)
              .png()
              .toBuffer();
            const derivedPath = path.join(characterDir, `${target}.png`);
            await fs.promises.writeFile(derivedPath, resized);
          }),
        );
      }
    }),
  );

  await Promise.all(tasks);

  const manifestFile = path.join(outDir, "manifest.json");
  await fs.promises.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote manifest ${manifestFile}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
