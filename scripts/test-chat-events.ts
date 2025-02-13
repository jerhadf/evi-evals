import { HumeClient } from 'hume';

const testChatEvents = async () => {
  // Get API key from environment
  const localApiKey = process.env.NEXT_PUBLIC_HUME_API_KEY || process.env.HUME_API_KEY;
  if (!localApiKey) {
    console.error('Error: Missing HUME_API_KEY environment variable');
    process.exit(1);
  }

  console.log('API Key found:', localApiKey.slice(0, 4) + '...' + localApiKey.slice(-4));

  // Initialize client
  const client = new HumeClient({ apiKey: localApiKey });
  const chatId = '0d4f7b8e-2e72-40c3-8ec6-c8b2b163fa0a';

  try {
    console.log('\nFetching chat events...');
    const chatEventsIterator = await client.empathicVoice.chats.listChatEvents(chatId);
    const allEvents = [];

    // Collect all events
    for await (const event of chatEventsIterator) {
      allEvents.push(event);
    }

    // Filter for user messages only
    const userMessages = allEvents.filter(event =>
      event.type === 'USER_MESSAGE'
    );

    console.log(`\nFound ${userMessages.length} user messages:\n`);

    // Process each message
    userMessages.forEach((msg) => {
      if (!msg.messageText) return;

      let emotionStr = '{neutral}';

      if (msg.emotionFeatures) {
        try {
          const emotions = JSON.parse(msg.emotionFeatures);
          const topEmotions = Object.entries(emotions)
            .map(([name, score]) => ({
              name: name.toLowerCase().replace(' (negative)', '').replace(' (positive)', ''),
              score: score as number
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(({ name, score }) => `${name} ${score.toFixed(4)}`)
            .join(', ');

          emotionStr = `{${topEmotions}}`;
        } catch (error) {
          console.error('Error parsing emotions:', error);
        }
      }

      // Output in the exact format needed
      console.log(`${msg.messageText} ${emotionStr}`);
    });

  } catch (error) {
    console.error('\nError fetching chat events:');
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
};

// Run the test
testChatEvents().catch(error => {
  console.error('Unhandled error in testChatEvents:');
  console.error(error);
});