// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const objToEnv = (obj: Record<string, any>) => {
  return Object.entries(obj)
    .map(([key, value]) => {
      const v = typeof value === 'string' ? `'${value}'` : value;
      return [key, '=', v].join(' ');
    })
    .join('\n');
};
