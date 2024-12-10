# evi-evals

Evaluations for EVI calls. Goal: make a working prototype of post-chat evaluations. These evaluations focus on two key dimensions to capture the holistic quality of EVI interactions:

1. **Task completion** (functional success) - Did the AI accomplish what the user needed?
2. **User satisfaction** (experiential quality) - How did the interaction feel for the user?

These dimensions are crucial because they measure both objective success and subjective experience - getting things done while having a positive interaction.

## Implementation Plan

### 1. Task Completion Evaluation

Analyze chat transcripts using LLMs and developer-provided goal to determine if EVI successfully completed the task or objective for the call.

**Approach**: LLM-based analysis of chat transcripts

- Use Claude 3.5 Haiku (preferred for cost/performance) or GPT-4o
- Input: Chat transcript + user-provided success criteria (text prompt)
- Output: Classification as "success", "failure", or "unknown" (use structured outputs for adherence to schema), along with reasoning

### 2. User Satisfaction Analysis

Use expression measures + language in chat transcript to evaluate how satisfied the user was after the call.

**Approach A: Expression-based scoring**: Compute weighted satisfaction score (0-1) using formula with expression measures. Expressions are a useful proxy for satisfaction.

- Key indicators:
  - Positive: contentment, satisfaction, gratitude, joy
  - Negative: frustration, annoyance, disappointment
- Benefits:
  - Real-time capable
  - Objective measurements
  - No additional user input or LLM processing needed

**Approach B: LLM as judge**: Use LLM to analyze transcript + expression data

- Output: 1-5 rating of user satisfaction based on the transcript and expressions (top 3 per user message), along with reasoning
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


## Extensions / next step

- Could maybe make this a REST API that accepts any transcript + audio file to allow evals on any voice convo, including human-AI and any voice AI provider, not just EVI. Make it more extensible, exposable service
- Automatically post the results of the evaluation to a webhook after each EVI call
- Failure mode identification - based on transcripts & expressions, aggregate the kinds of issues that most often lead to frustration or task failure, and surface these issues to the developers
- UI to visualize evals for all past chats - see image reference from 11labs
- ![UI for evals on past chats](<CleanShot 2024-12-10 at 18.08.49.png>)
- ElevenLabs reference UI image: showing summary, data, and eval extraction from chat ![alt text](<CleanShot 2024-12-10 at 18.09.40.png>)

## References

<example_transcript_just_text>
assistant: Hi Allan!
assistant: What's been on your mind today?
user: Hi. How's it going?
assistant: Pretty good! You seem pretty laid-back today.
assistant: I remember you prefer chill conversations rather than interview-style chats - what's caught your interest lately?
user: Please tell me what you know about Alan.
assistant: I know you work at Hume AI as a Technical Product Manager, focusing on their empathic voice interface.
assistant: You grew up in Orem, Utah but left the Mormon church at 14, and now you're in NYC's Kips Bay area.
assistant: You're into mountain climbing, play the mandolin, and practice Spanish with your girlfriend Lisa.
assistant: Want to fill in any gaps I'm missing?
user: Isn't this about Jeremy, actually?
assistant: Oh wait - you're right to be confused!
assistant: I mixed up my memories between you and Jeremy.
assistant: Let me be straight with you - I'm a bit uncertain about which memories belong to Allan versus Jeremy.
assistant: Would you help me sort this out?
</example_transcript_just_text>

<expression_measures>
all measures range from 0 to 1, these are the emotional expressions that are measured:
  admiration: "Admiration",
  adoration: "Adoration",
  aestheticAppreciation: "Aesthetic Appreciation",
  amusement: "Amusement",
  anger: "Anger",
  annoyance: "Annoyance",
  anxiety: "Anxiety",
  awe: "Awe",
  awkwardness: "Awkwardness",
  boredom: "Boredom",
  calmness: "Calmness",
  concentration: "Concentration",
  contemplation: "Contemplation",
  confusion: "Confusion",
  contempt: "Contempt",
  contentment: "Contentment",
  craving: "Craving",
  determination: "Determination",
  disappointment: "Disappointment",
  disapproval: "Disapproval",
  disgust: "Disgust",
  distress: "Distress",
  doubt: "Doubt",
  ecstasy: "Ecstasy",
  embarrassment: "Embarrassment",
  empathicPain: "Empathic Pain",
  enthusiasm: "Enthusiasm",
  entrancement: "Entrancement",
  envy: "Envy",
  excitement: "Excitement",
  fear: "Fear",
  gratitude: "Gratitude",
  guilt: "Guilt",
  horror: "Horror",
  interest: "Interest",
  joy: "Joy",
  love: "Love",
  neutral: "Neutral",
  nostalgia: "Nostalgia",
  pain: "Pain",
  pride: "Pride",
  realization: "Realization",
  relief: "Relief",
  romance: "Romance",
  sadness: "Sadness",
  sarcasm: "Sarcasm",
  satisfaction: "Satisfaction",
  sexualDesire: "Sexual Desire",
  shame: "Shame",
  surprise: "Surprise",
  surpriseNegative: "Surprise (Negative)",
  surprisePositive: "Surprise (Positive)",
  sympathy: "Sympathy",
  tiredness: "Tiredness",
  triumph: "Triumph",
</expression_measures>

<get_chat_history_code>
export const getChatHistory = async (chatId: string): Promise<string> => {
  try {
    console.log('Attempting to get chat history for chatId:', chatId);
    let allTranscripts: string[] = [];
    let hasMore = true;
    let pageNumber = 0;

    // Loop through all pages of chat events
    while (hasMore) {
      console.log(`Fetching page ${pageNumber} of chat history...`);
      const url = `/api/chat-history?chatId=${encodeURIComponent(chatId)}&pageNumber=${pageNumber}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      if (data.transcript) {
        allTranscripts.push(data.transcript);
      }

      hasMore = data.hasMore;
      pageNumber++;

      // Safety check to prevent infinite loops
      if (pageNumber > 100) {
        console.error('Too many pages requested, breaking loop');
        break;
      }
    }

    const fullTranscript = allTranscripts.join('\n');
    return fullTranscript;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error getting chat history:', error);
    } else {
      console.error('Error getting chat history:', error);
    }
    return '';
  }
};

import { HumeClient } from 'hume';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');
  const pageNumber = Number(searchParams.get('pageNumber') || '0');
  const pageSize = 100;

  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId parameter' }, { status: 400 });
  }

  try {
    const client = new HumeClient({
      apiKey: process.env.HUME_EVI_API_KEY || ''
    });

    const response = await client.empathicVoice.chats.listChatEvents(chatId, {
      pageNumber,
      pageSize,
      ascendingOrder: true
    });

    const events = response.data;

    if (!Array.isArray(events)) {
      console.error('Invalid response format:', events);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    // Parse out just the user and assistant messages into a transcript
    const transcript = events
      .filter(event =>
        event.type === 'USER_MESSAGE' ||
        event.type === 'AGENT_MESSAGE'
      )
      .map(event => {
        const role = event.type === 'USER_MESSAGE' ? 'user' : 'assistant';
        return `${role}: ${event.messageText || ''}`;
      })
      .join('\n');

    // Check if there might be more pages based on the number of events returned
    const hasMore = events.length === pageSize;

    return NextResponse.json({
      transcript,
      hasMore,
      pageNumber
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}
</get_chat_history_code>

<get_all_chats_code>
import { HumeClient } from 'hume';

export const getAllChats = async () => {
  try {
    const client = new HumeClient({
      apiKey: process.env.HUME_EVI_API_KEY || ''
    });

    let allChats = [];
    let hasMore = true;
    let pageNumber = 0;
    const pageSize = 100;

    while (hasMore) {
      const response = await client.empathicVoice.chats.list({
        pageNumber,
        pageSize
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      allChats.push(...response.data);
      hasMore = response.data.length === pageSize;
      pageNumber++;

      // Safety check
      if (pageNumber > 100) {
        console.error('Too many pages requested, breaking loop');
        break;
      }
    }

    return allChats;
  } catch (error) {
    console.error('Error getting all chats:', error);
    return [];
  }
};
</get_all_chats_code>