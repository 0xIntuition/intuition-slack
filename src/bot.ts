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

if (process.env.NODE_ENV !== 'production' && !process.env.SLACK_APP_TOKEN) {
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
  socketMode: process.env.NODE_ENV === 'production' ? false : true,
  appToken: process.env.SLACK_APP_TOKEN
});

app.command('/intuition', async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack('Searching...');



  const result: any = await searchAtoms(command.text);

  const atomBlocks: any = []


  result.atoms.forEach((atom: any) => {
    const description = atom.value?.thing?.description ? atom.value?.thing?.description : atom.value?.person?.description || '';
    const url = atom.value?.thing?.url ? atom.value?.thing?.url : atom.value?.person?.url || '';
    const mainBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<https://beta.portal.intuition.systems/app/identity/${atom.id}|*${atom.label}*> \n${description}\n<https://i7n.app/a/${atom.id}|i7n> ${url}`
      }
    };

    if (atom.image) {
      mainBlock['accessory'] = {
        type: 'image',
        image_url: atom.image,
        alt_text: 'alt text for image'
      }
    }
    atomBlocks.push(mainBlock);

    if (atom.asSubject.length > 0) {
      let triples = 'Claims:';
      atom.asSubject.forEach((triple: any) => {
        triples += `\n✅ ${triple.vault.positionCount}${parseInt(triple.counterVault.positionCount) > 0 ? ' / ❌ ' + triple.counterVault.positionCount : ''} - ${triple.predicate.label} ${triple.object.label}`;
      });


      atomBlocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: triples
          },
        });
    }
    atomBlocks.push(
      {
        "type": "divider"
      });
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
  ]


  try {
    await respond({
      blocks
    });
  } catch (error) {
    console.error(error.message);
  }
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
