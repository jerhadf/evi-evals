# evi-evals

https://evi-evals.vercel.app/

Evaluations for EVI calls. Goal: make a working prototype of post-chat evaluations. These evaluations focus on two key dimensions to capture the holistic quality of EVI interactions:

1. **Task completion** (functional success) - Did the AI accomplish what the user needed?
2. **User satisfaction** (experiential quality) - How did the interaction feel for the user?

These dimensions are crucial because they measure both objective success and subjective experience - getting things done while having a positive interaction.

## Setup

1. Clone repository
2. Install dependencies (`pnpm install`)
3. Create .env.local with API keys (see env.example)
4. Start the development server: `npm run dev`

## Implementation Plan

### TODOS (next steps)

✅ Add API route that fetches the full chat transcript including the expression measures given a chat ID (`route.ts`)
✅ When I click Run Evaluation, the full transcript of the call should appear in a way that makes sense in the UI (including the expression measures). This transcript should be viewed as a collapsible, non-editable text box in the "Evaluation Results" screen that comes after clicking the button.
✅ In the evaluation results screen, a 'satisfaction score' should appear that is just a satisfaction score from 1 to 5. This satisfaction score should be computed with the LLM as judge approach.
✅ In the evaluation results screen, a 'task completion' box should appear that is just a YES or NO.
⚪ Use the Vercel AI SDK to pass the full transcript to an LLM (Gemini 2.0 Flash) and produce an excellent, accurate summary
⚪ In the evaluation results screen, ensure that a a 'summary' box that is just a condensed summary of the call appears above the full transcript box. This should be a full 1-2 sentence summary of the entire call, very concise
⚪ Use the Vercel AI SDK to pass the full transcript to an LLM (Gemini 2.0 Flash), along with the user's task success criteria description, and produce a structured output (along with reasoning) for whether the task was a Success, a Failure, or Unknown
⚪ Add detailed reasoning/explanation UI component for the task completion assessment.
✅ Add detailed reasoning/explanation UI component for the satisfaction score using structured outputs from the LLM.
✅ Use the Vercel AI SDK to pass the full transcript to an LLM (claude-3-5-sonnet) and compute a satisfaction score, implement this as an efficient API route. This should be completed right after the transcript is fetched - right after it's fetched, get a satisfaction score (along with the reasoning for this score, 1-4 sentences). This score should prioritize the User's messages, and focus on their language AND their emotional expressions, especially toward the end of the call. It should try to figure out: are they satisfied? Why or why not? Use structured outputs with a Zod schema that has a score from 1 to 5 with clear descriptions for each score level.
⚪ Simplify the Success Criteria box so it's a bit smaller, is just called AI Task Description, and the box just says in fairly simple natural language - describe the AI's task/goals and what constitutes success for this.
⚪ Improve the UI polish and design to make it pretty, improve the loading states to be a bit more transparent.

Use the next.js app router pattern to add these as appropriate API routes for the prototype. Use good design patterns that will look good and be efficient and effective.

Use the vercel AI SDK for all interaction with LLMs - https://sdk.vercel.ai/docs/introduction. AI SDK standardises structured object generation across model providers with the generateObject and streamObject functions. You can use both functions with different output strategies, e.g. array, object, or no-schema, and with different generation modes, e.g. auto, tool, or json. You can use Zod schemas, Valibot, or JSON schemas to specify the shape of the data that you want. Use this for structured outputs with Zod schemas.

### Task completion evaluation details

Analyze chat transcripts using LLMs and developer-provided goal to determine if EVI successfully completed the task or objective for the call.

**Approach**: LLM-based analysis of chat transcripts

- Use GPT-4o-Mini
- Input: Chat transcript + user-provided success criteria (text prompt)
- Output: Classification as "success", "failure", or "unknown" (use structured outputs for adherence to schema), along with reasoning

### 2. User satisfaction score

Use expression measures + language in chat transcript to evaluate how satisfied the user was after the call.

**Approach A: Expression-based scoring**: Compute weighted satisfaction score (0-1) using formula with expression measures. Expressions are a useful proxy for satisfaction.

- Key indicators:
  - Positive: contentment, satisfaction, gratitude, joy
  - Negative: frustration, annoyance, disappointment
- Benefits:
  - Real-time capable
  - Objective measurements
  - No additional user input or LLM processing needed

**[SELECTED] Approach B: LLM as judge**: Use LLM to analyze transcript + expression data

- Output: 1-5 rating of user satisfaction based on the transcript and expressions (top 3 per user message), along with reasoning. Use claude-3-5-sonnet as the judge.
- Benefits:
  - More nuanced evaluation
  - Human-like reasoning on how satisfied the user was
  - Detailed feedback

**Approach C: Custom model**: Train a regression model to predict satisfaction from expressions + language

- Input: Audio call recordings + satisfaction labels (CSAT ratings?) for each chat
- Output: Satisfaction score (0-1) with confidence level
- Pros:
  - Data-driven predictions & fast inference
  - Can be validated against CSAT scores
  - Combines signal from both expressions and language
- Cons:
  - Need a good labeled dataset (maybe can collect with Joaquin/Theodore?)
  - Custom model may not generalize to all call recordings with different characteristics

## Technical implementation

**Format**: simple website using the TypeScript SDK, Next.js, deployed on vercel. With a text box for the chat ID and a text box for the users task completion criteria and We'll have to figure out some way to manage authentication because You can only access chats if you're using the API key that's associated with those chats but we Don't want them to have to paste in their API key directly into their website So figure out some way do that.

**UI**: Create the website with v0 or other AI website generator with a detailed prompt. Style should be functional, minimalist, elegant. Fairly sharp lines, slightly rounded corners on boxes. Think of UI for other things.

## Extensions / next steps

- Make an evaluation that determines how consistent the AI's judgement of user satisfaction is with user's self-reported satisfaction and/or CSAT scores
- Could maybe make this a REST API that accepts any transcript + audio file to allow evals on any voice convo, including human-AI and any voice AI provider, not just EVI. Make it more extensible, exposable service
- Could we somehow plug this API into any websocket API to allow us to 'listen in' on human or AI calls, and output a user satisfaction score at the end?
- Automatically post the results of the evaluation to a webhook after each EVI call
- Failure mode identification - based on transcripts & expressions, aggregate the kinds of issues that most often lead to frustration or task failure, and surface these issues to the developers
- UI to visualize evals for all past chats - see image reference from 11labs
- ![UI for evals on past chats](<CleanShot 2024-12-10 at 18.08.49.png>)
- ElevenLabs reference UI image: showing summary, data, and eval extraction from chat ![alt text](<CleanShot 2024-12-10 at 18.09.40.png>)
