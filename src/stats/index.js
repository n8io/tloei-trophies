import { getConfig } from 'config';
import { Matchup } from 'types/matchup';
import { Trophy } from 'types/trophy';
import { fetch as fetchWeekScores } from '../scores';
import { addAdjustments } from './adjustments';

const { PRINT } = getConfig();

export const process = async ({ seasonId, settings, weekId }) => {
  const matchups = await fetchWeekScores({ seasonId, settings, weekId });
  const slimMatchups = await Matchup.apiToUi(
    addAdjustments({ matchups, settings })
  );

  const flattened = Matchup.uiToFlattened(settings)(slimMatchups);

  const trophies = [
    {
      players: Trophy.findDefensivePlayerHighScore(flattened, 3),
      trophy: Trophy.HS_DP,
    },
    {
      players: Trophy.findOffensivePlayerHighScore(flattened, 3),
      trophy: Trophy.HS_OP,
    },
    {
      players: Trophy.findSpecialTeamsPlayerHighScore(flattened, 3),
      trophy: Trophy.HS_ST,
    },
    {
      players: Trophy.findHindsightPlayerHighScore(flattened, 3),
      trophy: Trophy.HS_BP,
    },
    {
      players: Trophy.findTeamHighScore(slimMatchups, 3),
      trophy: Trophy.HS_T,
    },
  ];

  PRINT && Trophy.print(trophies);
};
