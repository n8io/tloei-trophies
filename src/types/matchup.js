import { reduce } from 'ramda';

const apiToUi = reduce(
  (acc, { away, home, id }) => [
    ...acc,
    {
      away: {
        adjustments: away.adjustments,
        teamId: away.teamId,
      },
      home: {
        adjustments: home.adjustments,
        teamId: home.teamId,
      },
      id,
    },
  ],
  []
);

export const Matchup = {
  apiToUi,
};
