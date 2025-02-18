// API route for retrieving the full chat transcript for the chat, with top 3 emotional expressions for each user message

import { HumeClient } from 'hume';
import { NextResponse } from 'next/server';
import type { ReturnChatEvent } from 'hume/api/resources/empathicVoice';

// Emotion intensity ranges for adverb selection
const ADVERB_RANGES = {
  'Very Slightly': [0, 0.26],
  'Slightly': [0.26, 0.35],
  'Somewhat': [0.35, 0.44],
  'Moderately': [0.44, 0.53],
  'Quite': [0.53, 0.62],
  'Very': [0.62, 0.71],
  'Extremely': [0.71, 10],
} as const;

// Mapping of emotion names to their adjective forms
const EMOTION_ADJECTIVES = new Map([
  ['Admiration', 'admiring'],
  ['Adoration', 'adoring'],
  ['Aesthetic Appreciation', 'appreciative'],
  ['Amusement', 'amused'],
  ['Anger', 'angry'],
  ['Anxiety', 'anxious'],
  ['Awe', 'awestruck'],
  ['Awkwardness', 'uncomfortable'],
  ['Boredom', 'bored'],
  ['Calmness', 'calm'],
  ['Concentration', 'focused'],
  ['Contemplation', 'contemplative'],
  ['Confusion', 'confused'],
  ['Contempt', 'contemptuous'],
  ['Contentment', 'content'],
  ['Craving', 'hungry'],
  ['Determination', 'determined'],
  ['Disappointment', 'disappointed'],
  ['Disgust', 'disgusted'],
  ['Distress', 'distressed'],
  ['Doubt', 'doubtful'],
  ['Ecstasy', 'euphoric'],
  ['Embarrassment', 'embarrassed'],
  ['Empathic Pain', 'disturbed'],
  ['Entrancement', 'entranced'],
  ['Envy', 'envious'],
  ['Excitement', 'excited'],
  ['Fear', 'fearful'],
  ['Guilt', 'guilty'],
  ['Horror', 'horrified'],
  ['Interest', 'interested'],
  ['Joy', 'happy'],
  ['Love', 'enamored'],
  ['Nostalgia', 'nostalgic'],
  ['Pain', 'pained'],
  ['Pride', 'proud'],
  ['Realization', 'inspired'],
  ['Relief', 'relieved'],
  ['Romance', 'smitten'],
  ['Sadness', 'sad'],
  ['Satisfaction', 'satisfied'],
  ['Desire', 'desirous'],
  ['Shame', 'ashamed'],
  ['Surprise (negative)', 'negatively surprised'],
  ['Surprise (positive)', 'positively surprised'],
  ['Sympathy', 'sympathetic'],
  ['Tiredness', 'tired'],
  ['Triumph', 'triumphant'],
]);

function getAdverbForScore(score: number): string {
  for (const [adverb, [lower, upper]] of Object.entries(ADVERB_RANGES)) {
    if (score >= lower && score < upper) {
      return adverb.toLowerCase();
    }
  }
  return 'somewhat'; // Default fallback
}

function formatEmotions(event: ReturnChatEvent): string {
  if (!event.emotionFeatures) {
    return '{neutral}';
  }

  try {
    const emotions = JSON.parse(event.emotionFeatures);

    // Get top 3 emotions with scores
    const topEmotions = Object.entries(emotions)
      .map(([name, score]) => ({
        name: name.replace(' (negative)', '').replace(' (positive)', ''),
        score: score as number
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (topEmotions.length === 0) {
      return '{neutral}';
    }

    // Format each emotion with its adverb and adjective form
    const formattedEmotions = topEmotions
      .map(({ name, score }) => {
        const adverb = getAdverbForScore(score);
        const adjective = EMOTION_ADJECTIVES.get(name) || name.toLowerCase();
        return `${adverb} ${adjective}`;
      })
      .join(', ');

    return `{${formattedEmotions}}`;
  } catch (error) {
    console.error('Error parsing emotions:', error);
    return '{neutral}';
  }
}

export async function POST(request: Request) {
  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chatId parameter' }, { status: 400 });
    }

    // Get API key from request headers or environment
    const apiKey = request.headers.get('X-Hume-Api-Key') || process.env.HUME_API_KEY;
    if (!apiKey) {
      console.error('Missing HUME_API_KEY environment variable and no API key provided in request');
      return NextResponse.json(
        { error: 'Missing API credentials' },
        { status: 500 }
      );
    }

    // Initialize client
    const client = new HumeClient({ apiKey });
    const allEvents: ReturnChatEvent[] = [];

    try {
      // Get chat events iterator
      const chatEventsIterator = await client.empathicVoice.chats.listChatEvents(chatId);

      // Collect all events
      for await (const event of chatEventsIterator) {
        allEvents.push(event);
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

          // Add emotions for user messages only
          if (role === 'user') {
            const emotionStr = formatEmotions(event);
            return `${role}: ${message} ${emotionStr}`;
          }

          return `${role}: ${message}`;
        })
        .join('\n');

      return NextResponse.json({ transcript });
    } catch (error) {
      console.error('Error fetching chat events:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch chat events' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in transcript API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate transcript' },
      { status: 500 }
    );
  }
}