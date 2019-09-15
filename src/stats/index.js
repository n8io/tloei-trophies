import { getConfig } from 'config';
import { Matchup } from 'types/matchup';
import { fetch as fetchWeekScores } from '../scores';
import { addAdjustments, apply } from './adjustments';
import { print } from './adjustments/print';

const { PRINT } = getConfig();

export const process = async ({ settings, weekId }) => {
  const matchups = await fetchWeekScores({ settings, weekId });
  const amendedMatchups = addAdjustments({ matchups, settings });
  const slimMatchups = await Matchup.apiToUi(amendedMatchups);

  PRINT && print({ matchups: slimMatchups, settings });

  await apply({ matchups: slimMatchups, weekId });
};
