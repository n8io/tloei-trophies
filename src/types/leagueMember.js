import { find, path, pick, propEq } from 'ramda';

const selector = path(['league', 'teams']);

const findById = ({ id, settings }) =>
  find(propEq('id', id), selector(settings));

const apiToUi = pick(['abbrev', 'id', 'logo']);

export const LeagueMember = {
  apiToUi,
  findById,
  selector,
};
