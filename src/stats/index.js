import { getConfig } from 'config';
import got from 'got';
import { Matchup } from 'types/matchup';
import { Trophy } from 'types/trophy';
import { log } from 'utils/log';
import { fetch as fetchWeekScores } from '../scores';
import { addAdjustments } from './adjustments';

const { APPLY_TROPHIES, NOTIFY, PRINT, SLACK_WEBHOOK_URL } = getConfig();

// eslint-disable-next-line no-console
const print = trophies => PRINT && console.log(Trophy.print(trophies));

const logTrophies = async options => {
  log(`📜 Updating trophy log...`);

  const uri = await Trophy.saveGoogle(options);

  log(`✅ Successfully logged trophies to ${uri}`);
};

// eslint-disable-next-line max-statements
const sendSlackMessage = async ({ isMarkdown = false, text }) => {
  if (!SLACK_WEBHOOK_URL) {
    log(`⚠️ Not sending Slack messaage. SLACK_WEBHOOK_URL not set`);

    return;
  }

  try {
    const body = JSON.stringify({
      mrkdwn: isMarkdown,
      text,
    });

    log(`⬆️ Sending Slack message...`);

    const { body: responseBody } = await got.post(SLACK_WEBHOOK_URL, {
      body,
      headers: {
        'content-type': 'application/json',
      },
      returnType: 'json',
    });

    if (responseBody !== 'ok') {
      throw new Error('Failed to send slack message', responseBody);
    }

    log(`✔️ Successfully sent Slack message.`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

const saveGist = async options => {
  log(`💾️ Uploading trophy summary...`);

  const uri = await Trophy.saveGist(options);

  log(`✅ Saved trophy summary to ${uri}`);

  return uri;
};

const save = async options => {
  if (!APPLY_TROPHIES) {
    log(`👋 APPLY_TROPHIES flag is not enabled. Not applying trophies.`);

    return;
  }

  const summaryUrl = await saveGist(options);

  if (NOTIFY) {
    const { weekId } = options;
    const slackMessage = `🏆 <${summaryUrl}|Week ${weekId} trophies> have been assigned.`;

    await sendSlackMessage({ text: slackMessage });
  }

  await logTrophies({ ...options, summaryUrl });
};

const process = async ({ seasonId, settings, weekId }) => {
  const matchups = await fetchWeekScores({ seasonId, settings, weekId });
  const slimMatchups = await Matchup.apiToUi(
    addAdjustments({ matchups, settings })
  );

  const flattened = Matchup.uiToFlattened(settings)(slimMatchups);

  const trophies = [
    {
      key: 'HS_T',
      players: Trophy.calculateTeamHighScores(slimMatchups, 3),
    },
    {
      key: 'HS_OP',
      players: Trophy.calculateOffensivePlayerHighScores(flattened, 3),
    },
    {
      key: 'HS_DP',
      players: Trophy.calculateDefensivePlayerHighScores(flattened, 3),
    },
    {
      key: 'HS_STP',
      players: Trophy.calculateSpecialTeamsPlayerHighScores(flattened, 3),
    },
    {
      key: 'HS_BP',
      players: Trophy.calculateBenchPlayerHighScores(flattened, 3),
    },
  ];

  await print(trophies);
  await save({ seasonId, trophies, weekId });
};

export { process };
