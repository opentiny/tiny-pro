import board from './board';
import forms from './forms';
import list from './list';
import profile from './profile';
import application from './application';
import project from './project';
import bootstrap from './bootstrap';
import editor from './editor';
import home from './home';

export default [
  ...board,
  ...list,
  ...profile,
  ...forms,
  ...application,
  ...project,
  ...bootstrap,
  ...editor,
  ...home,
] as const;
