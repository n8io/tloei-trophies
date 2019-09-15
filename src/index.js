import { getConfig, validate } from 'config';
import { load as loadSettings } from 'settings';
import { process } from 'stats';
import { Season } from 'types/season';
import { Week } from 'types/week';

(async () => {
  try {
    const config = getConfig();

    validate(config);

    const seasonId = await Season.current();
    const weekId = await Week.current();
    const settings = await loadSettings();

    await process({ seasonId, settings, weekId });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
})();
