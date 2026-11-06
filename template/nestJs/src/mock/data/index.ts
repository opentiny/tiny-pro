import board from './board';
import forms from './forms';
import list from './list';
import profile from './profile';
import application from './application';

export default [
  ...board,
  ...list,
  ...profile,
  ...forms,
  ...application,
] as const;
