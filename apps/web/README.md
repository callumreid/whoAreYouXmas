# whoAreYouXmas

A fast, single-player Christmas personality game with weird holiday energy.

## Local Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
```

If the API key is missing or the request fails, the app will fall back to a local canned result.

## Content Editing

- Questions: `src/content/questions.ts`
- Characters: `src/content/characters.ts`
- Loading phrases: `src/content/loadingPhrases.ts`

## Deployment (Vercel)

1. Import the repo into Vercel.
2. Add `OPENAI_API_KEY` as an environment variable.
3. Deploy.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
```
