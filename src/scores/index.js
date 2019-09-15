import { fetch as fetchMatchups } from './matchups';

export const fetch = ({ settings, weekId }) =>
  fetchMatchups({ settings, weekId });
