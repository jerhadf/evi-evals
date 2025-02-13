import { HumeClient } from 'hume';
import { NextResponse } from 'next/server';
import type { ReturnChatEvent } from 'hume/api/resources/empathicVoice';

// Define extended type for chat events with emotions
interface ChatEventWithEmotions extends ReturnChatEvent {
  emotion_features?: string;  // JSON string containing emotion scores
}

interface EmotionScores {
  [key: string]: number;
}

function getTopThreeEmotions(event: ChatEventWithEmotions): Array<{ name: string; score: number }> {
  if (!event.emotion_features) {
    console.log('No emotion_features found for message:', event.messageText);
    return [];
  }

  try {
    // Parse the emotion_features JSON string
    console.log('Raw emotion_features:', event.emotion_features);
    const emotions: EmotionScores = JSON.parse(event.emotion_features);
    console.log('Parsed emotions:', emotions);

    // Convert to array of [emotion, score] pairs and sort by score
    const emotionPairs = Object.entries(emotions)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    console.log('Top three emotions:', emotionPairs);
    return emotionPairs;
  } catch (error) {
    console.error('Error parsing emotions for message:', event.messageText);
    console.error('Parse error:', error);
    return [];
  }
}

// Emotion intensity ranges
const ADVERB_RANGES = {
  'Very Slightly': [0, 0.26],
  'Slightly': [0.26, 0.35],
  'Somewhat': [0.35, 0.44],
  'Moderately': [0.44, 0.53],
  'Quite': [0.53, 0.62],
  'Very': [0.62, 0.71],
  'Extremely': [0.71, 10],
} as const;

function getAdverbForScore(score: number): string {
  for (const [adverb, [lower, upper]] of Object.entries(ADVERB_RANGES)) {
    if (score >= lower && score < upper) {
      return adverb.toLowerCase();
    }
  }
  return 'somewhat';
}

function formatEmotions(emotions: Array<{ name: string; score: number }>): string {
  if (emotions.length === 0) {
    return '{neutral}';
  }

  const topThree = emotions.map(emotion => {
    const adverb = getAdverbForScore(emotion.score);
    // Convert emotion name to lowercase and handle special cases
    const name = emotion.name.toLowerCase().replace(' (negative)', '').replace(' (positive)', '');
    return `${adverb} ${name}`;
  }).join(', ');

  return `{${topThree}}`;
}

export async function POST(request: Request) {
  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chatId parameter' }, { status: 400 });
    }

    // Prefer .env.local API key if present
    const localApiKey = process.env.NEXT_PUBLIC_HUME_API_KEY || process.env.HUME_API_KEY;
    if (!localApiKey) {
      console.error('Missing HUME_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Missing API credentials' },
        { status: 500 }
      );
    }

    // Initialize client with API key
    const client = new HumeClient({ apiKey: localApiKey });
    const allEvents: ChatEventWithEmotions[] = [];

    try {
      console.log(`Fetching events for chat ID: ${chatId}`);

      // Get an async iterator for all chat events
      const chatEventsIterator = await client.empathicVoice.chats.listChatEvents(chatId);

      // Collect all events from the iterator
      for await (const event of chatEventsIterator) {
        // Cast each event to our extended type
        allEvents.push(event as ChatEventWithEmotions);
      }

      console.log(`Successfully fetched ${allEvents.length} events`);
    } catch (error) {
      console.error('Error fetching chat events:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch chat events' },
        { status: 500 }
      );
    }

    if (allEvents.length === 0) {
      return NextResponse.json(
        { error: 'No events found for the provided chat ID' },
        { status: 404 }
      );
    }

    // Generate transcript with emotions for user messages
    const transcript = allEvents
      .filter(event =>
        event.type === 'USER_MESSAGE' ||
        event.type === 'AGENT_MESSAGE'
      )
      .map(event => {
        const role = event.type === 'USER_MESSAGE' ? 'user' : 'assistant';
        const message = event.messageText || '';

        // Add emotions for user messages
        if (role === 'user') {
          console.log('\nProcessing user message:', {
            text: message.slice(0, 50) + '...',
            hasEmotions: !!event.emotion_features,
            emotionLength: event.emotion_features?.length || 0
          });
          const topEmotions = getTopThreeEmotions(event);
          const emotionStr = formatEmotions(topEmotions);
          console.log('Formatted emotions:', emotionStr);
          return `${role}: ${message} ${emotionStr}`;
        }

        return `${role}: ${message}`;
      })
      .join('\n');

    // Log metadata but don't include in response
    console.log('Transcript metadata:', {
      totalMessages: allEvents.length,
      userMessages: allEvents.filter(e => e.type === 'USER_MESSAGE').length,
      assistantMessages: allEvents.filter(e => e.type === 'AGENT_MESSAGE').length
    });

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Error in transcript API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate transcript' },
      { status: 500 }
    );
  }
}