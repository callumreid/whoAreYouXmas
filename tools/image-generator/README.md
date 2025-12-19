# Image Generator

Generate style-anchored character images using the OpenAI Images API.

## Setup

- Set `OPENAI_API_KEY` in your shell.
- Install dependencies from repo root:

```bash
pnpm install
```

## Usage

From repo root:

```bash
pnpm image:gen -- --anchor ./assets/style/cow-santa.png
```

Paths are resolved from the repo root, so `apps/web/public/...` works from anywhere.

Common options:

```bash
pnpm image:gen -- \
  --anchor ./assets/style/cow-santa.png \
  --out apps/web/public/characters \
  --size 1024x1024 \
  --concurrency 3 \
  --derived
```

Flags:

- `--anchor <path>` (required) Reference image used as the style anchor.
- `--out <dir>` Output directory (default: `apps/web/public/characters`).
- `--size <WxH>` Size for generated image (default: `1024x1024`).
- `--force` Regenerate even if file already exists.
- `--concurrency <n>` Parallel requests (default: `3`, max `4`).
- `--derived` Also write `@512` and `@256` PNGs using sharp.

## Outputs

- One PNG per character name, saved as a slug (e.g. `krampus.png`).
- `manifest.json` mapping character name to output path.
- If the output directory is inside `apps/web/public`, manifest paths are web-rooted.

Character names are sourced from `apps/web/src/content/characters.ts`.
