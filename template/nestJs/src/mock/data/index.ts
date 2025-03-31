import board from './board';
import forms from './forms';
import list from './list';
import profile from './profile';
import user from './user';

export default [...board, ...list, ...profile, ...user, ...forms] as const;
