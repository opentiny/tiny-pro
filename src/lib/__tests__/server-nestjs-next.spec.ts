import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerFrameworks, BuildTool } from '../interfaces';

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
  prompt: vi.fn(),
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
import {
  getFeatureConfigure,
  getAuthConfigure,
  createNextNestjsServer,
} from '../init/server-nestjs-next';
import utils from '../utils';

const mockPrompt = vi.mocked(inquirer.prompt);
const mockCopySync = vi.mocked(copySync);
const mockWriteFileSync = vi.mocked(writeFileSync);

describe('getFeatureConfigure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call inquirer.prompt with confirm question for preview', async () => {
    mockPrompt.mockResolvedValue({ preview: true });

    const result = await getFeatureConfigure();

    expect(mockPrompt).toHaveBeenCalledTimes(1);
    const question = mockPrompt.mock.calls[0][0] as any[];
    expect(question).toHaveLength(1);
    expect(question[0].type).toBe('confirm');
    expect(question[0].name).toBe('preview');
    expect(question[0].default).toBe(false);
    expect(result).toEqual({ preview: true });
  });

  it('should return preview false by default', async () => {
    mockPrompt.mockResolvedValue({ preview: false });

    const result = await getFeatureConfigure();

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

    const result = await getAuthConfigure();

    expect(mockPrompt).toHaveBeenCalledTimes(1);
    const questions = mockPrompt.mock.calls[0][0] as any[];
    expect(questions).toHaveLength(8);
    expect(questions[0].name).toBe('session_limit');
    expect(questions[1].name).toBe('accessTokenTTL');
    expect(questions[2].name).toBe('refreshTokenTTL');
    expect(questions[3].name).toBe('apiTokenTTL');
    expect(questions[4].name).toBe('jwt.mode');
    expect(questions[5].name).toBe('jwt.secret');
    expect(questions[6].name).toBe('jwt.publicKeyPath');
    expect(questions[7].name).toBe('jwt.privateKeyPath');
  });

  it('should return auth config with secret mode', async () => {
    const authResult = {
      session_limit: 2,
      accessTokenTTL: 600,
      refreshTokenTTL: 172800,
      apiTokenTTL: 1209600,
      jwt: { mode: 'secret', secret: 'test-secret' },
    };
    mockPrompt.mockResolvedValue(authResult);

    const result = await getAuthConfigure();

    expect(result.session_limit).toBe(2);
    expect(result.accessTokenTTL).toBe(600);
    expect(result.refreshTokenTTL).toBe(172800);
    expect(result.apiTokenTTL).toBe(1209600);
    expect(result.jwt.mode).toBe('secret');
    expect(result.jwt.secret).toBe('test-secret');
  });

  it('should return auth config with local-key mode', async () => {
    const authResult = {
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: {
        mode: 'local-key',
        publicKeyPath: '/path/to/public.pem',
        privateKeyPath: '/path/to/private.pem',
      },
    };
    mockPrompt.mockResolvedValue(authResult);

    const result = await getAuthConfigure();

    expect(result.jwt.mode).toBe('local-key');
    expect(result.jwt.publicKeyPath).toBe('/path/to/public.pem');
    expect(result.jwt.privateKeyPath).toBe('/path/to/private.pem');
  });

  it('should have correct defaults for auth questions', async () => {
    mockPrompt.mockResolvedValue({});

    await getAuthConfigure();

    const questions = mockPrompt.mock.calls[0][0] as any[];
    expect(questions[0].default).toBe(1);
    expect(questions[1].default).toBe(300);
    expect(questions[2].default).toBe(86400);
    expect(questions[3].default).toBe(604800);
    expect(questions[4].default).toBe('secret');
  });

  it('jwt.secret question should only show when mode is secret', async () => {
    mockPrompt.mockResolvedValue({});

    await getAuthConfigure();

    const questions = mockPrompt.mock.calls[0][0] as any[];
    const secretQuestion = questions[5];
    expect(secretQuestion.name).toBe('jwt.secret');
    expect(secretQuestion.when({ jwt: { mode: 'secret' } })).toBe(true);
    expect(secretQuestion.when({ jwt: { mode: 'local-key' } })).toBe(false);
  });

  it('jwt.publicKeyPath and jwt.privateKeyPath questions should only show when mode is local-key', async () => {
    mockPrompt.mockResolvedValue({});

    await getAuthConfigure();

    const questions = mockPrompt.mock.calls[0][0] as any[];
    const pubKeyQuestion = questions[6];
    const privKeyQuestion = questions[7];

    expect(pubKeyQuestion.name).toBe('jwt.publicKeyPath');
    expect(pubKeyQuestion.when({ jwt: { mode: 'local-key' } })).toBe(true);
    expect(pubKeyQuestion.when({ jwt: { mode: 'secret' } })).toBe(false);

    expect(privKeyQuestion.name).toBe('jwt.privateKeyPath');
    expect(privKeyQuestion.when({ jwt: { mode: 'local-key' } })).toBe(true);
    expect(privKeyQuestion.when({ jwt: { mode: 'secret' } })).toBe(false);
  });
});

describe('createNextNestjsServer', () => {
  const baseAnswers = {
    name: 'my-project',
    description: 'test',
    framework: 'tinyvue',
    serverFramework: ServerFrameworks.NestJsNext,
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should copy template to dist path excluding node_modules', async () => {
    mockPrompt.mockResolvedValueOnce({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });
    mockPrompt.mockResolvedValueOnce({ preview: false });

    await createNextNestjsServer(baseAnswers);

    expect(mockCopySync).toHaveBeenCalledWith(
      '/template/nest-next',
      '/dist/my-project/nest',
      expect.objectContaining({
        filter: expect.any(Function),
      })
    );

    const filterFn = mockCopySync.mock.calls[0][2].filter as Function;
    expect(filterFn('some/node_modules/file')).toBe(false);
    expect(filterFn('some/src/file')).toBe(true);
  });

  it('should write config.json with correct database and redis config', async () => {
    mockPrompt.mockResolvedValueOnce({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });
    mockPrompt.mockResolvedValueOnce({ preview: false });

    await createNextNestjsServer(baseAnswers);

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/dist/my-project/nest/configs/config.json',
      expect.any(String)
    );

    const writtenContent = JSON.parse(
      mockWriteFileSync.mock.calls[0][1] as string
    );
    expect(writtenContent.database).toEqual({
      host: 'db-host',
      port: 3307,
      user: 'admin',
      password: 'secret',
      dbName: 'mydb',
    });
    expect(writtenContent.redis).toEqual({
      host: 'redis-host',
      port: 6380,
      user: 'root',
      password: 'root',
      db: 0,
    });
  });

  it('should write config.json with feature config', async () => {
    mockPrompt.mockResolvedValueOnce({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 'test-secret' },
    });
    mockPrompt.mockResolvedValueOnce({ preview: true });

    await createNextNestjsServer(baseAnswers);

    const writtenContent = JSON.parse(
      mockWriteFileSync.mock.calls[0][1] as string
    );
    expect(writtenContent.feature.preview).toBe(true);
  });

  it('should write config.json with auth config in secret mode', async () => {
    mockPrompt.mockResolvedValueOnce({
      session_limit: 2,
      accessTokenTTL: 600,
      refreshTokenTTL: 172800,
      apiTokenTTL: 1209600,
      jwt: { mode: 'secret', secret: 'my-jwt-secret' },
    });
    mockPrompt.mockResolvedValueOnce({ preview: false });

    await createNextNestjsServer(baseAnswers);

    const writtenContent = JSON.parse(
      mockWriteFileSync.mock.calls[0][1] as string
    );
    expect(writtenContent.auth.session_limit).toBe(2);
    expect(writtenContent.auth.accessTokenTTL).toBe(600);
    expect(writtenContent.auth.refreshTokenTTL).toBe(172800);
    expect(writtenContent.auth.apiTokenTTL).toBe(1209600);
    expect(writtenContent.auth.jwt.mode).toBe('secret');
    expect(writtenContent.auth.jwt.secret).toBe('my-jwt-secret');
  });

  it('should write config.json with auth config in local-key mode', async () => {
    mockPrompt.mockResolvedValueOnce({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: {
        mode: 'local-key',
        publicKeyPath: '/keys/public.pem',
        privateKeyPath: '/keys/private.pem',
      },
    });
    mockPrompt.mockResolvedValueOnce({ preview: false });

    await createNextNestjsServer(baseAnswers);

    const writtenContent = JSON.parse(
      mockWriteFileSync.mock.calls[0][1] as string
    );
    expect(writtenContent.auth.jwt.mode).toBe('local-key');
    expect(writtenContent.auth.jwt.publicKeyPath).toBe('/keys/public.pem');
    expect(writtenContent.auth.jwt.privateKeyPath).toBe('/keys/private.pem');
  });

  it('should use utils.getTemplatePath and utils.getDistPath with correct arguments', async () => {
    mockPrompt.mockResolvedValueOnce({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 's' },
    });
    mockPrompt.mockResolvedValueOnce({ preview: false });

    await createNextNestjsServer(baseAnswers);

    expect(utils.getTemplatePath).toHaveBeenCalledWith('nest-next');
    expect(utils.getDistPath).toHaveBeenCalledWith('my-project/nest');
    expect(utils.getDistPath).toHaveBeenCalledWith(
      'my-project/nest/configs/config.json'
    );
  });

  it('should handle undefined optional fields gracefully', async () => {
    const minimalAnswers = {
      ...baseAnswers,
      host: undefined,
      port: undefined,
      username: undefined,
      password: undefined,
      redisHost: undefined,
      redisPort: undefined,
      database: undefined,
    };
    mockPrompt.mockResolvedValueOnce({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 's' },
    });
    mockPrompt.mockResolvedValueOnce({ preview: false });

    await createNextNestjsServer(minimalAnswers);

    const writtenContent = JSON.parse(
      mockWriteFileSync.mock.calls[0][1] as string
    );
    expect(writtenContent.database.host).toBeUndefined();
    expect(writtenContent.database.port).toBeUndefined();
    expect(writtenContent.database.user).toBeUndefined();
    expect(writtenContent.database.password).toBeUndefined();
    expect(writtenContent.database.dbName).toBeUndefined();
    expect(writtenContent.redis.host).toBeUndefined();
    expect(writtenContent.redis.port).toBeUndefined();
  });

  it('should write formatted JSON (2-space indent)', async () => {
    mockPrompt.mockResolvedValueOnce({
      session_limit: 1,
      accessTokenTTL: 300,
      refreshTokenTTL: 86400,
      apiTokenTTL: 604800,
      jwt: { mode: 'secret', secret: 's' },
    });
    mockPrompt.mockResolvedValueOnce({ preview: false });

    await createNextNestjsServer(baseAnswers);

    const writtenContent = mockWriteFileSync.mock.calls[0][1] as string;
    expect(writtenContent).toContain('  ');
    expect(writtenContent).toContain('\n');
    const parsed = JSON.parse(writtenContent);
    expect(parsed).toBeDefined();
  });
});
