import board from './board';
import forms from './forms';
import list from './list';
import profile from './profile';
import user from './user';
import card from './application';

export default [
  ...board,
  ...list,
  ...profile,
  ...user,
  ...forms,
  ...card,
] as const;
