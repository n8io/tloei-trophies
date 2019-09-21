import { getConfig } from 'config';
import { Matchup } from 'types/matchup';
import { Trophy } from 'types/trophy';
import { log } from 'utils/log';
import { fetch as fetchWeekScores } from '../scores';
import { addAdjustments } from './adjustments';

const { APPLY_TROPHIES, PRINT } = getConfig();

export const process = async ({ seasonId, settings, weekId }) => {
  const matchups = await fetchWeekScores({ seasonId, settings, weekId });
  const slimMatchups = await Matchup.apiToUi(
    addAdjustments({ matchups, settings })
  );

  const flattened = Matchup.uiToFlattened(settings)(slimMatchups);

  const trophies = [
    {
      players: Trophy.calculateDefensivePlayerHighScores(flattened, 3),
      trophy: Trophy.HS_DP,
    },
    {
      players: Trophy.calculateOffensivePlayerHighScores(flattened, 3),
      trophy: Trophy.HS_OP,
    },
    {
      players: Trophy.calculateSpecialTeamsPlayerHighScores(flattened, 3),
      trophy: Trophy.HS_ST,
    },
    {
      players: Trophy.calculateHindsightPlayerHighScores(flattened, 3),
      trophy: Trophy.HS_BP,
    },
    {
      players: Trophy.calculateTeamHighScores(slimMatchups, 3),
      trophy: Trophy.HS_T,
    },
  ];

  PRINT && console.log(Trophy.print(trophies));

  if (APPLY_TROPHIES) {
    log(`💾️ Uploading trophy report...`);

    const url = await Trophy.save({
      seasonId,
      trophies,
      weekId,
    });

    log(`✅ Saved trophy report to ${url}`);
  }
};
