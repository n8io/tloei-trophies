import { getConfig } from 'config';

const {
  ESPN_LEAGUE_ID: leagueId,
  ESPN_SEASON_ID: seasonId,
  ESPN_WEEK_ID: weekId,
} = getConfig();

const hydrate = rawUrl =>
  rawUrl
    .replace(`{{leagueId}}`, leagueId)
    .replace(`{{seasonId}}`, seasonId)
    .replace(`{{weekId}}`, weekId);

const Url = {
  API_LEAGUE_SETTINGS:
    'https://fantasy.espn.com/apis/v3/games/ffl/seasons/{{seasonId}}/segments/0/leagues/{{leagueId}}',
  API_PLAYERS:
    'https://fantasy.espn.com/apis/v3/games/ffl/seasons/{{seasonId}}/players?scoringPeriodId={{weekId}}',
  API_SCORE_ADJUSTMENT:
    'https://fantasy.espn.com/apis/v3/games/ffl/seasons/{{seasonId}}/segments/0/leagues/{{leagueId}}/schedule',
  LOGIN: 'http://www.espn.com/login',
  SCOREBOARD:
    'https://fantasy.espn.com/football/league/scoreboard?leagueId={{leagueId}}&matchupPeriodId={{weekId}}',
  SETTINGS:
    'https://fantasy.espn.com/football/league/settings?leagueId={{leagueId}}&seasonId={{seasonId}}',
};

export { Url, hydrate };
