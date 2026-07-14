import pc from 'picocolors';
const info = (msg: string) => console.log(pc.gray(msg));
const success = (msg: string) => console.log(pc.green(msg));
const error = (msg: string) => console.log(pc.red(msg));

export const log = {
  info,
  success,
  error,
};
