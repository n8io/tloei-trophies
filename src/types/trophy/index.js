import { Calculations } from './calculations';
import { Enumeration } from './enumeration';
import { saveGist } from './gist';
import { print } from './print';

export const Trophy = {
  ...Enumeration,
  ...Calculations,
  print,
  save: saveGist,
};
