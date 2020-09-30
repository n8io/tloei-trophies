import { has, head, map } from 'ramda';
import slugify from 'slugify';
import { Google } from 'types/google';
import { shorten } from 'utils/bitly';
import { initialize, workbookUrl, worksheet } from 'utils/google';
import { Enumeration } from './enumeration';

const makeColumnUpdater = row => (name, value) => {
  if (!has(name, row)) return;

  row[name] = value;
};

const updatePlayerCells = (update, winner, basePoints) => {
  update('player', `${winner.firstName} ${winner.lastName}`);
  update('position', winner.position);
  update('team', winner.proTeam);
  update('adjustmentpoints', winner.bonus);
  update('basepoints', basePoints);
};

// eslint-disable-next-line max-statements
const saveTrophy = ({ doc, summaryUrl, weekId }) => async trophy => {
  const { key, players } = trophy;
  const winner = head(players);
  const sheet = await worksheet(doc, Google[key]);
  const rows = await sheet.getRows(sheet);
  const row = rows[weekId - 1];
  const update = makeColumnUpdater(row);
  const basePoints = winner.totalPoints - winner.bonus;

  row.summary = await shorten(
    `${summaryUrl}#${slugify(Enumeration[key]).toLowerCase()}s`
  );

  update('owner', `${winner.isTiebreakWinner ? '*' : ''}${winner.team}`);
  update('points', winner.totalPoints);

  if (key !== Google.HS_T) {
    updatePlayerCells(update, winner, basePoints);
  }

  await row.save();

  return Promise.resolve();
};

const save = async ({ summaryUrl, trophies, weekId }) => {
  const doc = await initialize();
  const logTrophy = saveTrophy({ doc, summaryUrl, weekId });

  const promises = map(logTrophy, trophies);

  await Promise.all(promises);

  return workbookUrl();
};

export { save };
