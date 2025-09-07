import dotEnv from 'dotenv-safe';
import { evolve, isNil, pick, pipe, prop } from 'ramda';
import { stringToBool } from 'utils/bool';
import { number } from 'utils/number';

dotEnv.config({
  allowEmptyValues: true,
});

// eslint-disable-next-line no-process-env
const config = Object.keys(process.env)
  .filter(
    k =>
      k.startsWith('ESPN_') ||
      [
        'APPLY_TROPHIES',
        'DEBUG',
        'FORCE_SHORT_LINK',
        'GITHUB_GIST_TOKEN',
        'GOOGLE_DOC_ID',
        'NOTIFY',
        'PREVIOUS_SEASON',
        'PREVIOUS_WEEK',
        'PRINT',
        'SHORT_IO_SECRET',
        'SHOW_CONFIG',
        'SLACK_WEBHOOK_URL',
      ].indexOf(k) > -1
  )
  // eslint-disable-next-line no-process-env
  .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {});

const getConfig = () =>
  pipe(
    props => ({
      APPLY_TROPHIES: false,
      DEBUG: '',
      FORCE_SHORT_LINK: false,
      GITHUB_GIST_TOKEN: '',
      GOOGLE_DOC_ID: '',
      NOTIFY: false,
      PREVIOUS_SEASON: false,
      PREVIOUS_WEEK: false,
      PRINT: false,
      SHORT_IO_SECRET: '',
      SHOW_CONFIG: false,
      SLACK_WEBHOOK_URL: '',
      ...props,
    }),
    evolve({
      APPLY_TROPHIES: stringToBool,
      ESPN_LEAGUE_ID: number(),
      ESPN_SEASON_ID: number(),
      ESPN_WEEK_ID: number(),
      FORCE_SHORT_LINK: stringToBool,
      NOTIFY: stringToBool,
      PREVIOUS_WEEK: stringToBool,
      PRINT: stringToBool,
      SHOW_CONFIG: stringToBool,
    })
  )(config);

const validate = cfg => {
  const requiredKeys = [
    'ESPN_LEAGUE_ID',
    'ESPN_SESSION_COOKIE',
    'FORCE_SHORT_LINK',
    'GITHUB_GIST_TOKEN',
    'GOOGLE_DOC_ID',
    'SLACK_WEBHOOK_URL',
  ];

  const invalidKeys = requiredKeys.filter(key => isNil(prop(key, cfg)));

  if (invalidKeys.length > 0) {
    const msg = `Config is missing required items: ${invalidKeys.join(', ')}`;

    throw new Error(msg);
  }

  cfg.SHOW_CONFIG &&
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(pick(['NOTIFY', 'PRINT', ...requiredKeys], cfg), null, 2)
    );
};

export { getConfig, validate };
