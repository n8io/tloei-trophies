const Enumeration = {
  LIGHT: 'modular',
  MATCHUPS: 'mMatchupScore',
  MEMBERS: 'mNav',
  SCORES: 'mScoreboard',
  SETTINGS: 'mSettings',
  STATS: 'mMatchupScore',
};

const LeagueView = {
  ...Enumeration,
  SEARCH_PARAM_NAME: 'view',
  WEEK_ID_PARAM_NAME: 'scoringPeriodId',
};

export { LeagueView };
