import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerFrameworks, BuildTool } from '../interfaces';

vi.mock('fs-extra', () => ({
  copySync: vi.fn(),
}));

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('../utils', () => ({
  default: {
    getTemplatePath: vi.fn((p) => `/template/${p}`),
    getDistPath: vi.fn((p) => `/dist/${p}`),
  },
}));

vi.mock('../init/env-config', () => ({
  objToEnv: vi.fn(() => 'MOCKED_ENV_CONTENT'),
}));

import { copySync } from 'fs-extra';
import { readFileSync, writeFileSync } from 'fs';
import { createNestJsServer } from '../init/server-nestjs';
import { objToEnv } from '../init/env-config';
import utils from '../utils';

const mockCopySync = vi.mocked(copySync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockWriteFileSync = vi.mocked(writeFileSync);
const mockObjToEnv = vi.mocked(objToEnv);

describe('createNestJsServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseAnswers = {
    name: 'my-project',
    description: 'test',
    framework: 'tinyvue',
    serverFramework: ServerFrameworks.NestJs,
    lowcodeEngine: '' as const,
    serverConfirm: true,
    dialect: 'mysql',
    host: 'db-host',
    port: 3307,
    database: 'mydb',
    username: 'admin',
    password: 'secret',
    redisHost: 'redis-host',
    redisPort: 6380,
    buildTool: BuildTool.Vite,
    vueVersion: 'tinyvue' as const,
  };

  it('should copy template to dist path', () => {
    mockReadFileSync.mockReturnValue(
      Buffer.from('services:\n  mysql:\n    environment:\n      {}')
    );

    createNestJsServer(baseAnswers);

    expect(mockCopySync).toHaveBeenCalledWith(
      `/template/${ServerFrameworks.NestJs}`,
      `/dist/my-project/${ServerFrameworks.NestJs}`
    );
  });

  it('should write .env file using objToEnv', () => {
    mockReadFileSync.mockReturnValue(
      Buffer.from('services:\n  mysql:\n    environment:\n      {}')
    );

    createNestJsServer(baseAnswers);

    expect(mockObjToEnv).toHaveBeenCalled();
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.env'),
      'MOCKED_ENV_CONTENT'
    );
  });

  it('should write docker-compose.yml with updated environment', () => {
    const yamlContent = `services:\n  mysql:\n    environment:\n      key: value\n`;
    mockReadFileSync.mockReturnValue(Buffer.from(yamlContent));

    createNestJsServer(baseAnswers);

    const writeCalls = mockWriteFileSync.mock.calls.filter((call) =>
      (call[0] as string).includes('docker-compose.yml')
    );
    expect(writeCalls.length).toBe(1);
  });

  it('should use default values when optional fields are missing', () => {
    const minimalAnswers = {
      ...baseAnswers,
      host: undefined,
      port: undefined,
      username: undefined,
      password: undefined,
      redisHost: undefined,
      redisPort: undefined,
    };
    mockReadFileSync.mockReturnValue(
      Buffer.from('services:\n  mysql:\n    environment:\n      {}')
    );

    createNestJsServer(minimalAnswers);

    const envCall = mockObjToEnv.mock.calls[0][0] as Record<string, any>;
    expect(envCall.DATABASE_HOST).toBe('localhost');
    expect(envCall.DATABASE_PORT).toBe(3306);
    expect(envCall.DATABASE_USERNAME).toBe('root');
    expect(envCall.DATABASE_PASSWORD).toBe('root');
    expect(envCall.REDIS_HOST).toBe('localhost');
    expect(envCall.REDIS_PORT).toBe(6379);
  });

  it('should use provided values for database and redis config', () => {
    mockReadFileSync.mockReturnValue(
      Buffer.from('services:\n  mysql:\n    environment:\n      {}')
    );

    createNestJsServer(baseAnswers);

    const envCall = mockObjToEnv.mock.calls[0][0] as Record<string, any>;
    expect(envCall.DATABASE_HOST).toBe('db-host');
    expect(envCall.DATABASE_PORT).toBe(3307);
    expect(envCall.DATABASE_USERNAME).toBe('admin');
    expect(envCall.DATABASE_PASSWORD).toBe('secret');
    expect(envCall.DATABASE_NAME).toBe('mydb');
    expect(envCall.REDIS_HOST).toBe('redis-host');
    expect(envCall.REDIS_PORT).toBe(6380);
  });

  it('should set DATABASE fields to false when dialect is empty', () => {
    const noDialectAnswers = {
      ...baseAnswers,
      dialect: '',
    };
    mockReadFileSync.mockReturnValue(
      Buffer.from('services:\n  mysql:\n    environment:\n      {}')
    );

    createNestJsServer(noDialectAnswers);

    const envCall = mockObjToEnv.mock.calls[0][0] as Record<string, any>;
    expect(envCall.DATABASE_HOST).toBeFalsy();
    expect(envCall.DATABASE_PORT).toBeFalsy();
    expect(envCall.DATABASE_USERNAME).toBeFalsy();
    expect(envCall.DATABASE_PASSWORD).toBeFalsy();
    expect(envCall.DATABASE_NAME).toBeFalsy();
  });

  it('should set fixed config values', () => {
    mockReadFileSync.mockReturnValue(
      Buffer.from('services:\n  mysql:\n    environment:\n      {}')
    );

    createNestJsServer(baseAnswers);

    const envCall = mockObjToEnv.mock.calls[0][0] as Record<string, any>;
    expect(envCall.DATABASE_SYNCHRONIZE).toBe(false);
    expect(envCall.DATABASE_AUTOLOADENTITIES).toBe(true);
    expect(envCall.AUTH_SECRET).toBe('secret');
    expect(envCall.REDIS_SECONDS).toBe(7200);
    expect(envCall.EXPIRES_IN).toBe('2h');
    expect(envCall.PAGINATION_PAGE).toBe(1);
    expect(envCall.PAGINATION_LIMIT).toBe(10);
  });
});
