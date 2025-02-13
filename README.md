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

1. When I click Run Evaluation, the full transcript of the call should appear in a way that makes sense in the UI (including the expression measures). This transcript should be viewed as a collapsible, non-editable text box in the "Evaluation Results" screen that comes after clicking the button.
2. In the evaluation results screen, ensure that a a 'summary' box that is just a condensed summary of the call appears below the transcript box.
3. In the evaluation results screen, a 'satisfaction score' should appear that is just a satisfaction score from 1 to 5. This satisfaction score should be computed with the LLM as judge approach - essentially pass the transcript to an LLM, use the system prompt to evaluate the transcript's satisfaction score from 1 to 5, and then output the reasoning as well (using structured outputs).
4. In the evaluation results screen, a 'task completion' box should appear that is just a YES or NO with an explanation below.

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

<example_transcript_expected_output>
assistant: Hi Allan!
assistant: What's been on your mind today?
user: Hi. How's it going? {somewhat interested, slightly confused, very slightly excited}
assistant: Pretty good! You seem pretty laid-back today.
assistant: I remember you prefer chill conversations rather than interview-style chats - what's caught your interest lately?
user: Please tell me what you know about Alan. {moderately interested, slightly confused, very slightly anxious}
assistant: I know you work at Hume AI as a Technical Product Manager, focusing on their empathic voice interface.
assistant: You grew up in Orem, Utah but left the Mormon church at 14, and now you're in NYC's Kips Bay area.
assistant: You're into mountain climbing, play the mandolin, and practice Spanish with your girlfriend Lisa.
assistant: Want to fill in any gaps I'm missing?
user: Isn't this about Jeremy, actually? {quite confused, moderately disappointed, somewhat contemptuous}
assistant: Oh wait - you're right to be confused!
assistant: I mixed up my memories between you and Jeremy.
user: Yeah this sucks. You're not good at this at all. You keep getting confused! I'm not enjoying this. {extremely angry, very disappointed, quite disgusted}
</example_transcript_expected_output>

<expression_measures_code_python>
from typing import Iterable, Tuple, TypeVar

T = TypeVar("T")


class Emotions:
    ADVERB_RANGES = {
        "Very Slightly": (0, 0.26),
        "Slightly": (0.26, 0.35),
        "Somewhat": (0.35, 0.44),
        "Moderately": (0.44, 0.53),
        "Quite": (0.53, 0.62),
        "Very": (0.62, 0.71),
        "Extremely": (0.71, 10),
    }
    DEFAULT_ADVERB = "Somewhat"
    PAIRS = [
        ("Admiration", "Admiring"),
        ("Adoration", "Adoring"),
        ("Aesthetic Appreciation", "Appreciative"),
        ("Amusement", "Amused"),
        ("Anger", "Angry"),
        ("Anxiety", "Anxious"),
        ("Awe", "Awestruck"),
        ("Awkwardness", "Uncomfortable"),
        ("Boredom", "Bored"),
        ("Calmness", "Calm"),
        ("Concentration", "Focused"),
        ("Contemplation", "Contemplative"),
        ("Confusion", "Confused"),
        ("Contempt", "Contemptuous"),
        ("Contentment", "Content"),
        ("Craving", "Hungry"),
        ("Determination", "Determined"),
        ("Disappointment", "Disappointed"),
        ("Disgust", "Disgusted"),
        ("Distress", "Distressed"),
        ("Doubt", "Doubtful"),
        ("Ecstasy", "Euphoric"),
        ("Embarrassment", "Embarrassed"),
        ("Empathic Pain", "Disturbed"),
        ("Entrancement", "Entranced"),
        ("Envy", "Envious"),
        ("Excitement", "Excited"),
        ("Fear", "Fearful"),
        ("Guilt", "Guilty"),
        ("Horror", "Horrified"),
        ("Interest", "Interested"),
        ("Joy", "Happy"),
        ("Love", "Enamored"),
        ("Nostalgia", "Nostalgic"),
        ("Pain", "Pained"),
        ("Pride", "Proud"),
        ("Realization", "Inspired"),
        ("Relief", "Relieved"),
        ("Romance", "Smitten"),
        ("Sadness", "Sad"),
        ("Satisfaction", "Satisfied"),
        ("Desire", "Desirous"),
        ("Shame", "Ashamed"),
        ("Surprise (negative)", "Negatively Surprised"),
        ("Surprise (positive)", "Positively Surprised"),
        ("Sympathy", "Sympathetic"),
        ("Tiredness", "Tired"),
        ("Triumph", "Triumphant"),
    ]

    ALL, ADJECTIVES = zip(*PAIRS)

    @classmethod
    def zip(cls, vals: Iterable[T]) -> Iterable[Tuple[str, T]]:
        return zip(cls.ALL, vals)

    @classmethod
    def get_adverb(cls, score: float) -> str:
        for adverb, (lower, upper) in cls.ADVERB_RANGES.items():
            if lower <= score < upper:
                return adverb
        return cls.DEFAULT_ADVERB


class EmotionsNLP:
    ALL = [
        "Admiration",
        "Adoration",
        "Aesthetic Appreciation",
        "Amusement",
        "Anger",
        "Annoyance",
        "Anxiety",
        "Awe",
        "Awkwardness",
        "Boredom",
        "Calmness",
        "Concentration",
        "Confusion",
        "Contemplation",
        "Contempt",
        "Contentment",
        "Craving",
        "Determination",
        "Disappointment",
        "Disapproval",
        "Disgust",
        "Distress",
        "Doubt",
        "Ecstasy",
        "Embarrassment",
        "Empathic Pain",
        "Enthusiasm",
        "Entrancement",
        "Envy",
        "Excitement",
        "Fear",
        "Gratitude",
        "Guilt",
        "Horror",
        "Interest",
        "Joy",
        "Love",
        "Nostalgia",
        "Pain",
        "Pride",
        "Realization",
        "Relief",
        "Romance",
        "Sadness",
        "Sarcasm",
        "Satisfaction",
        "Desire",
        "Shame",
        "Surprise (negative)",
        "Surprise (positive)",
        "Sympathy",
        "Tiredness",
        "Triumph",
    ]

    @classmethod
    def zip(cls, vals: Iterable[T]) -> Iterable[Tuple[str, T]]:
        return zip(cls.ALL, vals)

</expression_measures_code_python>

<getting_expressions_code>
import {
  Hume,
  HumeClient,
  convertBlobToBase64,
  convertBase64ToBlob,
  ensureSingleValidAudioTrack,
  getAudioStream,
  getBrowserSupportedMimeType,
  MimeType,
} from 'hume';
import { handleToolCallMessage } from './handleToolCall';
import './styles.css';
/**
   * callback function to handle a WebSocket message event
   *
   * API Reference:
   * - `chat_metadata`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Chat%20Metadata.type
   * - `user_message`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.User%20Message.type
   * - `assistant_message`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Assistant%20Message.type
   * - `audio_output`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Audio%20Output.type
   * - `user_interruption`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.User%20Interruption.type
   * - `tool_call`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Tool%20Call%20Message.type
   */
  async function handleWebSocketMessageEvent(
    message: Hume.empathicVoice.SubscribeEvent
  ): Promise<void> {
    /* place logic here which you would like to invoke when receiving a message through the socket */
    console.log(message);

    // handle messages received through the WebSocket (messages are distinguished by their "type" field.)
    switch (message.type) {
      // save chat_group_id to resume chat if disconnected
      case "chat_metadata":
        chatGroupId = message.chatGroupId;
        break;

      // append user and assistant messages to UI for chat visibility
      case "user_message":
      case "assistant_message":
        const { role, content } = message.message;
        const topThreeEmotions = extractTopThreeEmotions(message);
        appendMessage(role, content ?? "", topThreeEmotions);
        break;

      // add received audio to the playback queue, and play next audio output
      case "audio_output":
        // convert base64 encoded audio to a Blob
        const audioOutput = message.data;
        const blob = convertBase64ToBlob(audioOutput, mimeType);

        // add audio Blob to audioQueue
        audioQueue.push(blob);

        // play the next audio output
        if (audioQueue.length >= 1) playAudio();
        break;

      // stop audio playback, clear audio playback queue, and update audio playback state on interrupt
      case "user_interruption":
        stopAudio();
        break;

      // invoke tool upon receiving a tool_call message
      case "tool_call":
        handleToolCallMessage(message, socket);
        break;
    }
  }
</getting_expressions_code>

<generate_transcript_code>
import { HumeClient } from 'hume';
import { ReturnChatEvent } from 'hume/api/resources/empathicVoice';
import path from 'path';
import fs from 'fs/promises';
import * as crypto from 'crypto';
import { IncomingHttpHeaders } from 'http';

/**
 * Retrieves the HUME_API_KEY from environment variables.
 *
 * This function ensures that the HUME_API_KEY is available and throws an error if it is not set.
 * It is used to authenticate requests to the Hume API.
 *
 * @returns The HUME_API_KEY as a string.
 * @throws If the HUME_API_KEY environment variable is not set.
 */
function getHumeApiKey(): string {
  const apiKey = process.env.HUME_API_KEY;
  if (!apiKey) {
    throw new Error("HUME_API_KEY is not set in the environment variables.");
  }
  return apiKey;
}

/**
 * Fetches all chat events for a given chat ID from the Hume API.
 *
 * This function utilizes the HumeClient to retrieve all chat events associated with the specified chat ID.
 * It internally handles pagination by iterating through all available pages until every event is retrieved.
 *
 * @param chatId The unique identifier of the chat for which to fetch events.
 * @returns A promise that resolves to an array of chat events.
 * @throws If the HUME_API_KEY environment variable is not set.
 */
async function fetchAllChatEvents(chatId: string): Promise<ReturnChatEvent[]> {
  const apiKey = getHumeApiKey();

  const client = new HumeClient({ apiKey });
  const allChatEvents: ReturnChatEvent[] = [];

  // Retrieve an async iterator over all chat events
  const chatEventsIterator = await client.empathicVoice.chats.listChatEvents(chatId);

  // Collect all events from the iterator
  for await (const chatEvent of chatEventsIterator) {
    allChatEvents.push(chatEvent);
  }

  return allChatEvents;
}

/**
 * Generates a formatted transcript string from user and assistant messages.
 *
 * This function filters chat events to include only user and assistant messages,
 * then formats each message with a timestamp and role.
 *
 * @param chatEvents An array of chat events to parse.
 * @returns A formatted transcript string.
 */
function generateTranscript(chatEvents: ReturnChatEvent[]): string {
  // Filter events for user and assistant messages
  const relevantChatEvents = chatEvents.filter(
    (chatEvent) => chatEvent.type === 'USER_MESSAGE' || chatEvent.type === 'AGENT_MESSAGE',
  );

  // Map each relevant event to a formatted line
  const transcriptLines = relevantChatEvents.map((chatEvent) => {
    const role = chatEvent.role === 'USER' ? 'User' : 'Assistant';
    const timestamp = new Date(chatEvent.timestamp).toLocaleString();
    return `[${timestamp}] ${role}: ${chatEvent.messageText}`;
  });

  // Join all lines into a single transcript string
  return transcriptLines.join('\n');
}

async function saveTranscriptToFile(transcript: string, chatId: string): Promise<void> {
  const directory = path.join(__dirname, 'transcripts');
  const transcriptFileName = path.join(directory, `transcript_${chatId}.txt`);

  try {
    // Ensure the directory exists; create it if not
    await fs.mkdir(directory, { recursive: true });

    // Write the transcript to the file
    await fs.writeFile(transcriptFileName, transcript, 'utf8');

    console.log(`Transcript saved to ${transcriptFileName}`);
  } catch (fileError) {
    console.error(`Error writing to file ${transcriptFileName}:`, fileError);
  }
}

export async function getChatTranscript(chatId: string): Promise<void> {
  const chatEvents = await fetchAllChatEvents(chatId);
  const transcript = generateTranscript(chatEvents);
  await saveTranscriptToFile(transcript, chatId);
}

export function validateHmacSignature(
  payload: string,
  headers: IncomingHttpHeaders,
): void {
  // Retrieve the timestamp from headers
  const timestamp = headers['x-hume-ai-webhook-timestamp'];
  if (!timestamp) {
    console.error('Error: Missing timestamp in the request headers.');
    throw new Error('Missing timestamp header');
  }

  // Retrieve the signature from headers
  const signature = headers['x-hume-ai-webhook-signature'] as string;
  if (!signature) {
    console.error('Error: Missing signature in the request headers.');
    throw new Error('Missing signature header');
  }

  // Retrieve the API key from environment variables
  const apiKey = getHumeApiKey();

  // Construct the message to be hashed by concatenating the payload and the timestamp
  const message = `${payload}.${timestamp}`;
  const expectedSig = crypto
    .createHmac('sha256', apiKey)
    .update(message)
    .digest('hex');


  // Compare the provided signature with the expected one using timing-safe comparison
  const signatureBuffer = Buffer.from(signature, 'utf8');
  const expectedSigBuffer = Buffer.from(expectedSig, 'utf8');
  const validSignature =
    signatureBuffer.length === expectedSigBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedSigBuffer);

  // If the signatures do not match, throw an error
  if (!validSignature) {
    console.error(`Error: Invalid HMAC signature. Expected: ${expectedSig}, Received: ${signature}`);
    throw new Error('Invalid HMAC signature');
  }

  console.info('HMAC validation successful!');
}

export function validateTimestamp(headers: IncomingHttpHeaders): void {
  // Retrieve the timestamp from the headers
  const timestamp = headers['x-hume-ai-webhook-timestamp'] as string;
  if (!timestamp) {
    console.error('Error: Missing timestamp.');
    throw new Error('Missing timestamp');
  }

  // Attempt to parse the timestamp to a number
  let timestampInt: number;
  try {
    timestampInt = parseInt(timestamp, 10);
    if (isNaN(timestampInt)) {
      // parseInt can return NaN if the string isn't a valid integer
      throw new Error();
    }
  } catch (err) {
    console.error(`Error: Invalid timestamp format: ${timestamp}`);
    throw new Error('Invalid timestamp format');
  }

  // Get the current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);

  // Check if the timestamp is more than 180 seconds behind the current time
  const TIMESTAMP_VALIDATION_WINDOW = 180;
  if (currentTime - timestampInt > TIMESTAMP_VALIDATION_WINDOW) {
    console.error(`Error: The timestamp on the request is too old. Current time: ${currentTime}, Timestamp: ${timestamp}`);
    throw new Error('The timestamp on the request is too old');
  }

  console.info('Timestamp validation successful!');
}
</generate_transcript_code>

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
      apiKey: process.env.HUME_API_KEY || ''
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
      apiKey: process.env.HUME_API_KEY || ''
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