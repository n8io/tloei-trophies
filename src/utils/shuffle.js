import { curry } from 'ramda';

const shuffler = curry((random, list) => {
  const len = list.length;
  let idx = -1;
  let position = null;
  const result = [];

  while (++idx < len) {
    position = Math.floor((idx + 1) * random());
    result[idx] = result[position];
    result[position] = list[idx];
  }
  return result;
});

const shuffle = shuffler(Math.random);

export { shuffle };
