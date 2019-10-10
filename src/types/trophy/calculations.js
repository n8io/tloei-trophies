import {
  assoc,
  both,
  descend,
  filter,
  flatten,
  map,
  pick,
  pipe,
  prop,
  propEq,
  slice,
  uniq,
  sort,
} from 'ramda';
import { randomIndex } from 'utils/randomIndex';
import { rankByProp } from 'utils/rankByProp';
import { renameKeys } from 'utils/renameKeys';

const normalizePointsProp = map(
  renameKeys({ appliedStatTotal: 'totalPoints' })
);

const rankSort = (a, b) => {
  if (a.rank < b.rank) {
    return -1;
  } else if (a.rank > b.rank) {
    return 1;
  }

  if (a.isTiebreakWinner) {
    return -1;
  } else if (b.isTiebreakWinner) {
    return 1;
  }

  return 0;
};

const tiebreakEm = items => {
  const ranks = pipe(
    map(prop('rank')),
    uniq
  )(items);

  const updated = ranks.map(rank => {
    const ties = filter(propEq('rank', rank), items);

    if (ties.length === 1) {
      return flatten(ties);
    }

    const winnerIndex = randomIndex(ties);

    ties[winnerIndex].isTiebreakWinner = true;

    return flatten(ties);
  });

  return flatten(updated).sort(rankSort);
};

const normalize = limit =>
  pipe(
    sort(descend(prop('appliedStatTotal'))),
    normalizePointsProp,
    rankByProp('totalPoints'),
    tiebreakEm,
    slice(0, limit)
  );

const calculateDefensivePlayerHighScores = (players, limit = 1) =>
  pipe(
    filter(both(propEq('isStarter', true), propEq('isDefensive', true))),
    normalize(limit)
  )(players);

const calculateOffensivePlayerHighScores = (players, limit = 1) =>
  pipe(
    filter(both(propEq('isStarter', true), propEq('isOffensive', true))),
    normalize(limit)
  )(players);

const calculateSpecialTeamsPlayerHighScores = (players, limit = 1) =>
  pipe(
    filter(both(propEq('isStarter', true), propEq('isSpecialTeams', true))),
    normalize(limit)
  )(players);

const calculateBenchPlayerHighScores = (players, limit = 1) =>
  pipe(
    filter(propEq('isStarter', false)),
    normalize(limit)
  )(players);

const teamTransform = pipe(pick(['team', 'teamId', 'totalPoints']));

const matchupToTeamScores = ({ away, home }) => [
  teamTransform(away),
  teamTransform(home),
];

const calculateTeamHighScores = (matchups, limit = 1) =>
  pipe(
    map(matchupToTeamScores),
    flatten,
    map(obj => assoc('appliedStatTotal', prop('totalPoints', obj), obj)),
    normalize(limit)
  )(matchups);

export const Calculations = {
  calculateBenchPlayerHighScores,
  calculateDefensivePlayerHighScores,
  calculateOffensivePlayerHighScores,
  calculateSpecialTeamsPlayerHighScores,
  calculateTeamHighScores,
};
