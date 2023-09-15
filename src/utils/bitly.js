import { BitlyClient } from 'bitly';
import { getConfig } from 'config';
import { log } from './log';

const { BITLY_ACCESS_TOKEN } = getConfig();

const bitly = new BitlyClient(BITLY_ACCESS_TOKEN);

const shorten = async longUrl => {
  try {
    const { link } = await bitly.shorten(longUrl);

    return link;
  } catch (err) {
    log(`🛑 Failed to shorten url: ${longUrl}`);

    throw err;
  }
};

export { shorten };
