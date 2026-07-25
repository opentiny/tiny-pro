import { describe, it, expect } from 'vitest';
import { objToEnv } from '../init/env-config';

describe('objToEnv', () => {
  it('should convert string values with single quotes', () => {
    const result = objToEnv({ NAME: 'hello' });
    expect(result).toBe("NAME = 'hello'");
  });

  it('should convert number values without quotes', () => {
    const result = objToEnv({ PORT: 3306 });
    expect(result).toBe('PORT = 3306');
  });

  it('should convert boolean values without quotes', () => {
    const result = objToEnv({ ENABLED: true });
    expect(result).toBe('ENABLED = true');
  });

  it('should convert false values without quotes', () => {
    const result = objToEnv({ DISABLED: false });
    expect(result).toBe('DISABLED = false');
  });

  it('should join multiple entries with newlines', () => {
    const result = objToEnv({ HOST: 'localhost', PORT: 3306, SYNC: false });
    expect(result).toBe("HOST = 'localhost'\nPORT = 3306\nSYNC = false");
  });

  it('should handle empty object', () => {
    const result = objToEnv({});
    expect(result).toBe('');
  });
});
