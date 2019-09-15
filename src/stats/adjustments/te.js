import { flatten, propEq } from 'ramda';
import { Bonus } from 'types/bonus';
import { LineupSlot } from 'types/lineupSlots';
import { Player } from 'types/player';
import { Stat } from 'types/stat';

// eslint-disable-next-line new-cap
const teId = settings => LineupSlot.TE(settings).id;

const processPlayer = player => {
  const bonuses = [];
  const receptions = player.stats[Stat.REC.toString()] || 0;
  const receivingYards = player.stats[Stat.REC_YDS.toString()] || 0;

  const receptionBonus = receptions * Bonus.TE_REC;

  receptionBonus &&
    bonuses.push({
      bonus: receptionBonus,
      player: Player.apiToUi(player),
      type: 'TE_REC',
    });

  const receivingYardsBonus = receivingYards * Bonus.TE_REC_YDS;

  receivingYardsBonus &&
    bonuses.push({
      bonus: receivingYardsBonus,
      player: Player.apiToUi(player),
      type: 'TE_REC_YDS',
    });

  return bonuses;
};

// eslint-disable-next-line complexity, max-statements
export const adjustments = settings => players => {
  // eslint-disable-next-line new-cap
  const isTe = propEq('lineupSlotId', teId(settings));

  const tes = players.filter(isTe);

  const bonuses = tes.map(processPlayer);

  return flatten(bonuses);
};
