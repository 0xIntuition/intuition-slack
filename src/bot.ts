import { App } from '@slack/bolt';
import { config } from 'dotenv';
import { searchAtoms } from './queries';
config();
// Initializes your app with your bot token and signing secret

if (!process.env.SLACK_BOT_TOKEN) {
  console.log('SLACK_BOT_TOKEN is required to run this app');
  process.exit(1);
}

if (!process.env.SLACK_SIGNING_SECRET) {
  console.log('SLACK_SIGNING_SECRET is required to run this app');
  process.exit(1);
}

if (!process.env.SLACK_APP_TOKEN) {
  console.log('SLACK_APP_TOKEN is required to run this app');
  process.exit(1);
}

if (!process.env.GRAPHQL_ENDPOINT) {
  console.log('GRAPHQL_ENDPOINT is required to run this app');
  process.exit(1);
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

app.command('/atom', async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack('Searching...');



  const result: any = await searchAtoms(command.text);
  console.log(result);

  const atomBlocks = result.atoms.map((atom: any) => {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${atom.label}*\nID: ${atom.id}\n${atom.value?.thing?.description}`
      },
      accessory: {
        type: 'image',
        image_url: atom.image,
        alt_text: 'alt text for image'
      }
    }
  });

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Search results for ${command.text}`
      },

    },
    {
      "type": "divider"
    },
    ...atomBlocks,
    {
      "type": "divider"
    },
  ];

  await respond({
    blocks
  });
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
