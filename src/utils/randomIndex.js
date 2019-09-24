import { head, range } from 'ramda';
import { shuffle } from './shuffle';

const randomIndex = array => head(shuffle(range(0, array.length)));

export { randomIndex };
