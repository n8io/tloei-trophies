import {
  both,
  cond,
  descend,
  filter,
  flatten,
  map,
  pick,
  pipe,
  prop,
  propEq,
  slice,
  sort,
  T,
} from 'ramda';
import { renameKeys } from 'utils/renameKeys';

const Enumeration = {
  HS_BP: 'High Score Bench Player',
  HS_DP: 'High Score Defensive Player',
  HS_OP: 'High Score Offensive Player',
  HS_ST: 'High Score Special Teams Player',
  HS_T: 'High Scoring Team',
};

const normalizePointsProp = map(
  renameKeys({ appliedStatPoints: 'totalPoints' })
);

const findDefensivePlayerHighScore = (players, limit = 1) =>
  pipe(
    filter(both(propEq('isStarter', true), propEq('isDefensive', true))),
    sort(descend(prop('appliedStatTotal'))),
    slice(0, limit),
    normalizePointsProp
  )(players);

const findOffensivePlayerHighScore = (players, limit = 1) =>
  pipe(
    filter(both(propEq('isStarter', true), propEq('isOffensive', true))),
    sort(descend(prop('appliedStatTotal'))),
    slice(0, limit),
    normalizePointsProp
  )(players);

const findSpecialTeamsPlayerHighScore = (players, limit = 1) =>
  pipe(
    filter(both(propEq('isStarter', true), propEq('isSpecialTeams', true))),
    sort(descend(prop('appliedStatTotal'))),
    slice(0, limit),
    normalizePointsProp
  )(players);

const findHindsightPlayerHighScore = (players, limit = 1) =>
  pipe(
    filter(propEq('isStarter', false)),
    sort(descend(prop('appliedStatTotal'))),
    slice(0, limit)
  )(players);

const teamTransform = pipe(pick(['team', 'totalPoints']));

const matchupToTeamScores = ({ away, home }) => [
  teamTransform(away),
  teamTransform(home),
];

const findTeamHighScore = (matchups, limit = 1) =>
  pipe(
    map(matchupToTeamScores),
    flatten,
    sort(descend(prop('totalPoints'))),
    slice(0, limit)
  )(matchups);

const tab = '  ';

const printTeam = (p, index) => `${index + 1}. ${p.team} - ${p.totalPoints}`;

const printPlayer = (p, index) =>
  `${index + 1}. ${p.team} - ${p.proTeam.toUpperCase()} ${p.position} ${
    p.firstName
  } ${p.lastName} - ${p.appliedStatTotal}`;

const printHighScoreTeamTrophy = ({ players, trophy }) =>
  // eslint-disable-next-line no-console
  console.log(`${trophy}s\n${tab}${players.map(printTeam).join(`\n${tab}`)}`);

const printePlayerTrophy = ({ players, trophy }) =>
  // eslint-disable-next-line no-console
  console.log(`${trophy}s\n${tab}${players.map(printPlayer).join(`\n${tab}`)}`);

const printTrophy = cond([
  [propEq('trophy', Enumeration.HS_T), printHighScoreTeamTrophy],
  [T, printePlayerTrophy],
]);

const print = map(printTrophy);

export const Trophy = {
  ...Enumeration,
  findDefensivePlayerHighScore,
  findHindsightPlayerHighScore,
  findOffensivePlayerHighScore,
  findSpecialTeamsPlayerHighScore,
  findTeamHighScore,
  print,
};
