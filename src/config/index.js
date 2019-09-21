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
        'GITHUB_GIST_TOKEN',
        'PREVIOUS_SEASON',
        'PREVIOUS_WEEK',
        'PRINT',
        'SHOW_CONFIG',
      ].indexOf(k) > -1
  )
  // eslint-disable-next-line no-process-env
  .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {});

const getConfig = () =>
  pipe(
    props => ({
      APPLY_TROPHIES: false,
      DEBUG: '',
      GITHUB_GIST_TOKEN: '',
      PREVIOUS_SEASON: false,
      PREVIOUS_WEEK: false,
      PRINT: false,
      SHOW_CONFIG: false,
      ...props,
    }),
    evolve({
      APPLY_TROPHIES: stringToBool,
      ESPN_LEAGUE_ID: number(),
      ESPN_SEASON_ID: number(),
      ESPN_WEEK_ID: number(),
      PREVIOUS_WEEK: stringToBool,
      PRINT: stringToBool,
      SHOW_CONFIG: stringToBool,
    })
  )(config);

const validate = cfg => {
  const requiredKeys = [
    'ESPN_LEAGUE_ID',
    'ESPN_SESSION_COOKIE',
    'GITHUB_GIST_TOKEN',
  ];

  const invalidKeys = requiredKeys.filter(key => isNil(prop(key, cfg)));

  if (invalidKeys.length > 0) {
    const msg = `Config is missing required items: ${invalidKeys.join(', ')}`;

    throw new Error(msg);
  }

  cfg.SHOW_CONFIG &&
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(pick(requiredKeys, cfg), null, 2));
};

export { getConfig, validate };