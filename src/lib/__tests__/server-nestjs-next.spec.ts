import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerFrameworks, BuildTool } from '../interfaces';

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

vi.mock('fs-extra', () => ({
  copySync: vi.fn(),
}));

vi.mock('fs', () => ({
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

import inquirer from 'inquirer';
import { copySync } from 'fs-extra';
import { writeFileSync } from 'fs';
import utils from '../utils';
import {
  getFeatrueConfigrue,
  getAuthConfigure,
  createNextNestjsServer,
} from '../init/server-nestjs-next';

const mockPrompt = vi.mocked(inquirer.prompt);
const mockCopySync = vi.mocked(copySync);
const mockWriteFileSync = vi.mocked(writeFileSync);

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

describe('getFeatrueConfigrue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call inquirer.prompt with checkbox question for preview', async () => {
    mockPrompt.mockResolvedValue({ preview: true });

    const result = await getFeatrueConfigrue();

    expect(mockPrompt).toHaveBeenCalledOnce();
    const questions = mockPrompt.mock.calls[0][0];
    expect(questions).toHaveLength(1);
    expect(questions[0].type).toBe('checkbox');
    expect(questions[0].name).toBe('preview');
    expect(questions[0].default).toBe(false);
    expect(result).toEqual({ preview: true });
  });

  it('should return preview as false by default', async () => {
    mockPrompt.mockResolvedValue({ preview: false });

    const result = await getFeatrueConfigrue();

    expect(result.preview).toBe(false);
  });
});

describe('getAuthConfigure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call inquirer.prompt with auth questions', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'my-secret' },
    });

    await getAuthConfigure();

    expect(mockPrompt).toHaveBeenCalledOnce();
    const questions = mockPrompt.mock.calls[0][0];
    const names = questions.map((q: any) => q.name);
    expect(names).toContain('session_limit');
    expect(names).toContain('accessTokenTTL');
    expect(names).toContain('refreshTokenTTL');
    expect(names).toContain('apiTokenTTL');
    expect(names).toContain('jwt.mode');
    expect(names).toContain('jwt.secret');
    expect(names).toContain('jwt.publicKeyPath');
    expect(names).toContain('jwt.privateKeyPath');
  });

  it('should have correct defaults for auth fields', async () => {
    mockPrompt.mockResolvedValue({});

    await getAuthConfigure();

    const questions = mockPrompt.mock.calls[0][0];
    const findQ = (name: string) => questions.find((q: any) => q.name === name);

    expect(findQ('session_limit').default).toBe(1);
    expect(findQ('accessTokenTTL').default).toBe(300);
    expect(findQ('refreshTokenTTL').default).toBe(86400);
    expect(findQ('apiTokenTTL').default).toBe(604800);
    expect(findQ('jwt.mode').default).toBe('secret');
  });

  it('should show jwt.secret only when jwt.mode is secret', async () => {
    mockPrompt.mockResolvedValue({});

    await getAuthConfigure();

    const questions = mockPrompt.mock.calls[0][0];
    const secretQ = questions.find((q: any) => q.name === 'jwt.secret');

    expect(secretQ.when({ jwt: { mode: 'secret' } })).toBe(true);
    expect(secretQ.when({ jwt: { mode: 'local-key' } })).toBe(false);
  });

  it('should show jwt.publicKeyPath and jwt.privateKeyPath only when jwt.mode is local-key', async () => {
    mockPrompt.mockResolvedValue({});

    await getAuthConfigure();

    const questions = mockPrompt.mock.calls[0][0];
    const pubQ = questions.find((q: any) => q.name === 'jwt.publicKeyPath');
    const privQ = questions.find((q: any) => q.name === 'jwt.privateKeyPath');

    expect(pubQ.when({ jwt: { mode: 'local-key' } })).toBe(true);
    expect(pubQ.when({ jwt: { mode: 'secret' } })).toBe(false);
    expect(privQ.when({ jwt: { mode: 'local-key' } })).toBe(true);
    expect(privQ.when({ jwt: { mode: 'secret' } })).toBe(false);
  });

  it('should return auth configure with secret mode', async () => {
    const authResult = {
      session_limit: 2,
      accessTokenTTL: 600,
      refreshTokenTTL: 172800,
      apiTokenTTL: 1209600,
      jwt: { mode: 'secret', secret: 'my-jwt-secret' },
    };
    mockPrompt.mockResolvedValue(authResult);

    const result = await getAuthConfigure();

    expect(result).toEqual(authResult);
  });

  it('should return auth configure with local-key mode', async () => {
    const authResult = {
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: {
        mode: 'local-key',
        publicKeyPath: '/keys/public.pem',
        privateKeyPath: '/keys/private.pem',
      },
    };
    mockPrompt.mockResolvedValue(authResult);

    const result = await getAuthConfigure();

    expect(result).toEqual(authResult);
  });
});

describe('createNextNestjsServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should copy template from nest-next to dist path', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });

    await createNextNestjsServer(baseAnswers);

    expect(mockCopySync).toHaveBeenCalledWith(
      '/template/nest-next',
      '/dist/my-project/nest',
      expect.objectContaining({
        filter: expect.any(Function),
      })
    );
  });

  it('should filter out node_modules in copySync', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });

    await createNextNestjsServer(baseAnswers);

    const filterFn = mockCopySync.mock.calls[0][2].filter;
    expect(filterFn('/some/path/node_modules/pkg')).toBe(false);
    expect(filterFn('/some/path/src/main.ts')).toBe(true);
  });

  it('should write config.json with correct database config', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });

    await createNextNestjsServer(baseAnswers);

    const configPath = '/dist/my-project/nest/configs/config.json';
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      configPath,
      expect.any(String)
    );

    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    const config = JSON.parse(writtenContent);
    expect(config.database).toEqual({
      host: 'db-host',
      port: 3307,
      user: 'admin',
      password: 'secret',
      dbName: 'mydb',
    });
  });

  it('should write config.json with fixed redis defaults', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });

    await createNextNestjsServer(baseAnswers);

    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    const config = JSON.parse(writtenContent);
    expect(config.redis).toEqual({
      host: 'redis-host',
      port: 6380,
      user: 'root',
      password: 'root',
      db: 0,
    });
  });

  it('should write config.json with feature.preview as false', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });

    await createNextNestjsServer(baseAnswers);

    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    const config = JSON.parse(writtenContent);
    expect(config.feature).toEqual({ preview: false });
  });

  it('should write config.json with auth configure from getAuthConfigure', async () => {
    const authResult = {
      session_limit: 3,
      accessTokenTTL: 600,
      refreshTokenTTL: 172800,
      apiTokenTTL: 1209600,
      jwt: { mode: 'secret', secret: 'my-jwt-key' },
    };
    mockPrompt.mockResolvedValue(authResult);

    await createNextNestjsServer(baseAnswers);

    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    const config = JSON.parse(writtenContent);
    expect(config.auth).toEqual(authResult);
  });

  it('should write config.json with local-key jwt mode', async () => {
    const authResult = {
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: {
        mode: 'local-key',
        publicKeyPath: '/keys/public.pem',
        privateKeyPath: '/keys/private.pem',
      },
    };
    mockPrompt.mockResolvedValue(authResult);

    await createNextNestjsServer(baseAnswers);

    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    const config = JSON.parse(writtenContent);
    expect(config.auth.jwt).toEqual({
      mode: 'local-key',
      publicKeyPath: '/keys/public.pem',
      privateKeyPath: '/keys/private.pem',
    });
  });

  it('should call getAuthConfigure via inquirer.prompt', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });

    await createNextNestjsServer(baseAnswers);

    expect(mockPrompt).toHaveBeenCalledOnce();
  });

  it('should use utils.getTemplatePath with nest-next', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });

    await createNextNestjsServer(baseAnswers);

    expect(utils.getTemplatePath).toHaveBeenCalledWith('nest-next');
  });

  it('should use utils.getDistPath with correct project name', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });

    await createNextNestjsServer(baseAnswers);

    expect(utils.getDistPath).toHaveBeenCalledWith('my-project/nest');
    expect(utils.getDistPath).toHaveBeenCalledWith('my-project/nest/configs/config.json');
  });

  it('should write formatted JSON with 2-space indent', async () => {
    mockPrompt.mockResolvedValue({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });

    await createNextNestjsServer(baseAnswers);

    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    expect(writtenContent).toContain('  ');
    const parsed = JSON.parse(writtenContent);
    expect(parsed).toBeDefined();
  });
});
