import { getConfig, validate } from 'config';
import { load as loadSettings } from 'settings';
import { process } from 'stats';
import { Week } from 'types/week';

(async () => {
  try {
    const config = getConfig();

    validate(config);

    const weekId = await Week.getWeekId();
    const settings = await loadSettings();

    await process({ settings, weekId });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
})();
