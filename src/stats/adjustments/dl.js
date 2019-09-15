import { flatten, propEq } from 'ramda';
import { Bonus } from 'types/bonus';
import { LineupSlot } from 'types/lineupSlots';
import { Player } from 'types/player';
import { Stat } from 'types/stat';

// eslint-disable-next-line new-cap
const dlId = settings => LineupSlot.DL(settings).id;

const processPlayer = player => {
  const bonuses = [];

  const tackles = player.stats[Stat.TKS.toString()] || 0;
  const assists = player.stats[Stat.TKA.toString()] || 0;

  const tacklesBonus = tackles * Bonus.DL_TKS;

  tacklesBonus &&
    bonuses.push({
      bonus: tacklesBonus,
      player: Player.apiToUi(player),
      type: 'DL_TKS',
    });

  const assistsBonus = assists * Bonus.DL_AST;

  assistsBonus &&
    bonuses.push({
      bonus: assistsBonus,
      player: Player.apiToUi(player),
      type: 'DL_AST',
    });

  return bonuses;
};

// eslint-disable-next-line complexity, max-statements
export const adjustments = settings => players => {
  // eslint-disable-next-line new-cap
  const isDL = propEq('lineupSlotId', dlId(settings));
  const dls = players.filter(isDL);

  const bonuses = dls.map(processPlayer);

  return flatten(bonuses);
};
