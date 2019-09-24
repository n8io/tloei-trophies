import { getConfig } from 'config';
import json2md from 'json2md';
import {
  append,
  addIndex,
  always,
  cond,
  defaultTo,
  equals,
  flatten,
  insert,
  map,
  pipe,
  T,
  toUpper,
} from 'ramda';
import { Gist } from 'utils/gist';
import { Enumeration } from './enumeration';

const Rank = ['🥇', '🥈', '🥉'];

const { ESPN_LEAGUE_ID } = getConfig();

const toMd = data => json2md(data).trim();

const toUpperCase = pipe(
  defaultTo(''),
  toUpper
);

const mapIndexed = addIndex(map);

const formatTrophy = trophy => [{ h2: `${trophy}s` }];

const formatOwner = ({ seasonId, team, teamId, weekId }) =>
  toMd([
    {
      link: {
        source: `https://fantasy.espn.com/football/team?leagueId=${ESPN_LEAGUE_ID}&seasonId=${seasonId}&teamId=${teamId}&scoringPeriodId=${weekId}`,
        title: team,
      },
    },
  ]);

const toMatchupUrl = ({ message, seasonId, teamId, weekId }) =>
  toMd([
    {
      link: {
        source: `https://fantasy.espn.com/football/boxscore?leagueId=220779&scoringPeriodId=${weekId}&seasonId=${seasonId}&teamId=${teamId}&view=scoringperiod`,
        title: message,
      },
    },
  ]);

const formatTeam = ({ seasonId, weekId }) => team => {
  const { isTiebreakWinner, team: name, teamId, totalPoints } = team;

  const rank = `${isTiebreakWinner ? '*' : ''}${Rank[team.rank - 1]}`;
  const owner = formatOwner({ seasonId, team: name, teamId, weekId });
  const points = toMatchupUrl({
    message: totalPoints,
    seasonId,
    teamId,
    weekId,
  });

  return [rank, owner, points];
};

const formatTeams = ({ seasonId, weekId }) => teams => [
  {
    table: {
      headers: ['Rank', 'Owner', 'Points'],
      rows: map(formatTeam({ seasonId, weekId }), teams),
    },
  },
];

const formatPlayer = ({ seasonId, weekId }) => player => {
  const rank = `${player.isTiebreakWinner ? '*' : ''}${Rank[player.rank - 1]}`;
  const {
    bonus = 0,
    id,
    proTeam,
    position,
    firstName,
    lastName,
    team,
    teamId,
    totalPoints = 0,
  } = player;
  const name = toMd([
    {
      link: {
        source: `https://www.espn.com/nfl/player/gamelog/_/id/${id}`,
        title: `${firstName} ${lastName}`,
      },
    },
  ]);
  const basePoints = totalPoints - bonus;
  const owner = formatOwner({ seasonId, team, teamId, weekId });
  const playerInfo = `${name} / ${toUpperCase(position)} ${toUpperCase(
    proTeam
  )}`;

  const points = toMatchupUrl({
    message: totalPoints,
    seasonId,
    teamId,
    weekId,
  });

  return [rank, owner, points, playerInfo, basePoints, bonus];
};

const formatPlayers = ({ seasonId, weekId }) => players => {
  const format = formatPlayer({ seasonId, weekId });

  return [
    {
      table: {
        headers: ['Rank', 'Owner', 'Points', 'Player', 'Base Points', 'Bonus'],
        rows: mapIndexed(format, players),
      },
    },
  ];
};

const transformTrophy = ({ seasonId, weekId }) => ({ players, trophy }) => [
  ...formatTrophy(trophy),
  ...cond([
    [
      equals(Enumeration.HS_T),
      always(formatTeams({ seasonId, weekId })(players)),
    ],
    [T, always(formatPlayers({ seasonId, weekId })(players))],
  ])(trophy),
];

const formatDescription = ({ seasonId, weekId }) =>
  `Trophies for ${seasonId} Week ${weekId}`;

const formatFileName = ({ seasonId, weekId }) =>
  `S${seasonId}W${weekId.toString().padStart(2, '0')}.trophies.md`;

const formatTitle = ({ seasonId, weekId }) =>
  `${seasonId} Week ${weekId.toString().padStart(2, '0')} Trophies`;

const toFiles = ({ markdown: content, seasonId, weekId }) => ({
  [formatFileName({ seasonId, weekId })]: { content },
});

const addTrophyProp = ({ key, ...rest }) => ({
  ...rest,
  trophy: Enumeration[key],
});

const trophiesToGist = ({ seasonId, weekId }) =>
  pipe(
    map(addTrophyProp),
    map(transformTrophy({ seasonId, weekId })),
    insert(0, { h1: formatTitle({ seasonId, weekId }) }),
    insert(1, {
      p: `_Generated by robots on ${new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
      })} ET_`,
    }),
    append({
      p: '_* - won coin toss tiebreaker_',
    }),
    flatten,
    toMd,
    markdown => ({
      description: formatDescription({ seasonId, weekId }),
      files: toFiles({ markdown, seasonId, weekId }),
      public: true,
    })
  );

const save = async ({ seasonId, trophies, weekId }) => {
  const options = trophiesToGist({ seasonId, weekId })(trophies);

  // console.log(JSON.stringify(options, null, 2));

  const { html_url: url } = await Gist.create(options);

  return url;
};

export { save };
