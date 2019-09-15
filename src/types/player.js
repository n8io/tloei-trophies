import { defaultTo, find, pick, pipe } from 'ramda';

const selector = ({ lineupSlotId, playerPoolEntry }) => {
  const { appliedStatTotal, player } = playerPoolEntry;
  const {
    defaultPositionId,
    firstName,
    id,
    lastName,
    proTeamId,
    stats: statsFeeds,
  } = player;

  const stats = pipe(
    find(({ externalId }) => Number(externalId) > 400000000),
    defaultTo({
      appliedStats: {},
      stats: {},
    }),
    pick(['appliedStats', 'stats'])
  )(statsFeeds);

  return {
    appliedStatTotal,
    defaultPositionId,
    firstName,
    id,
    lastName,
    lineupSlotId,
    proTeamId,
    ...stats,
  };
};

const apiToUi = pick(['appliedStatTotal', 'firstName', 'id', 'lastName']);

export const Player = {
  apiToUi,
  selector,
};
