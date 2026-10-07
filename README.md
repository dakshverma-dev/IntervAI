# IntervAI

**A coding interview you can talk through.**

IntervAI is an interview-practice prototype combining a Monaco editor, conversational guidance, browser voice controls, and session metrics. It was built for Innov8 3.0 at IIT Delhi.

[Open demo](https://interv-ai-beta.vercel.app) · [Run locally](#run-locally) · [Voice implementation notes](VOICE_FEATURES.md)

## What the experience includes

- Python problems with an editor and an AI conversation alongside it.
- Feedback on the submitted code and hints during the session.
- Speech synthesis and recognition where supported by the browser.
- Session timing, submission counts, and heuristic complexity indicators.
- Gemini-backed responses, an OpenRouter path, and local demo responses.

## What “Run Code” currently does

The practice page inspects the source text and asks the feedback service to respond. It **does not run a Python interpreter or execute problem test cases**. Timing and complexity displays are heuristic or simulated.

For the later project with actual in-browser Python execution, see [AI Interviewer](https://github.com/dakshverma-dev/Ai-Interviewer).

## Run locally

Use Node.js 20 or later and npm.

```bash
git clone https://github.com/dakshverma-dev/IntervAI.git
cd IntervAI
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Without provider configuration, the application can use its demo responses.

To enable the Gemini path, create `.env.local`:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

The service also reads `NEXT_PUBLIC_OPENROUTER_API_KEY` for its alternative provider path. These `NEXT_PUBLIC_` values are included in browser code; the current provider integration is intended for local experimentation. A public deployment needs server-side credential handling.

## Explore it

1. Start a practice session.
2. Write an approach in the editor and submit it for feedback.
3. Ask a follow-up question or request a hint.
4. Try voice controls in a browser that supports them.
5. Review the session indicators.

Voice support varies by browser and permissions. Text interaction remains the baseline.

## Source tour

| File or directory | Responsibility |
| --- | --- |
| [Practice page](src/app/practice/page.tsx) | Session flow and heuristic code analysis |
| [AI service](src/services/AIService.ts) | Provider requests and demo responses |
| [Voice service](src/services/VoiceService.ts) | Browser speech integration |
| [Code editor](src/components/CodeEditor.tsx) | Monaco configuration |
| [Problems](src/data/problems.ts) | Coding challenge content |

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Monaco, and the Web Speech API.

## Build

```bash
npm run build
npm run start
```

The repository also provides `npm run lint`. The prototype has no production code-execution service or verified interview-scoring benchmark.
