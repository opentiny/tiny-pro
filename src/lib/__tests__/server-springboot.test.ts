import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerFrameworks, BuildTool } from '../interfaces';

vi.mock('fs-extra', () => ({
  copySync: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('properties-parser', () => ({
  createEditor: vi.fn(),
}));

vi.mock('@opentiny/cli-devkit', () => ({
  logs: () => ({
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('../utils', () => ({
  default: {
    getTemplatePath: vi.fn((p) => `/template/${p}`),
    getDistPath: vi.fn((p) => `/dist/${p}`),
  },
}));

import { copySync } from 'fs-extra';
import { existsSync } from 'fs';
import { createEditor } from 'properties-parser';
import { createSpringBootServer } from '../init/server-springboot';
import utils from '../utils';

const mockCopySync = vi.mocked(copySync);
const mockExistsSync = vi.mocked(existsSync);
const mockCreateEditor = vi.mocked(createEditor);

describe('createSpringBootServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseAnswers = {
    name: 'my-project',
    description: 'test',
    framework: 'tinyvue',
    serverFramework: ServerFrameworks.SpringBoot,
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
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    createSpringBootServer(baseAnswers);

    expect(mockCopySync).toHaveBeenCalledWith(
      `/template/${ServerFrameworks.SpringBoot}`,
      `/dist/my-project/${ServerFrameworks.SpringBoot}`
    );
  });

  it('should not proceed if properties file does not exist', () => {
    mockExistsSync.mockReturnValue(false);

    createSpringBootServer(baseAnswers);

    expect(mockCreateEditor).not.toHaveBeenCalled();
  });

  it('should create editor and save when properties file exists', () => {
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    createSpringBootServer(baseAnswers);

    expect(mockCreateEditor).toHaveBeenCalledOnce();
    expect(mockEditor.save).toHaveBeenCalledOnce();
  });

  it('should set server.port in properties', () => {
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    createSpringBootServer(baseAnswers);

    expect(mockEditor.set).toHaveBeenCalledWith('server.port', '3000');
  });

  it('should set datasource properties with provided values', () => {
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    createSpringBootServer(baseAnswers);

    expect(mockEditor.set).toHaveBeenCalledWith('spring.datasource.username', 'admin');
    expect(mockEditor.set).toHaveBeenCalledWith('spring.datasource.password', 'secret');
    expect(mockEditor.set).toHaveBeenCalledWith(
      'spring.datasource.url',
      expect.stringContaining('db-host')
    );
    expect(mockEditor.set).toHaveBeenCalledWith(
      'spring.datasource.url',
      expect.stringContaining('3307')
    );
    expect(mockEditor.set).toHaveBeenCalledWith(
      'spring.datasource.url',
      expect.stringContaining('mydb')
    );
  });

  it('should use default values when optional fields are missing', () => {
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    const minimalAnswers = {
      ...baseAnswers,
      host: undefined,
      port: undefined,
      username: undefined,
      password: undefined,
      database: undefined,
      redisHost: undefined,
      redisPort: undefined,
    };

    createSpringBootServer(minimalAnswers);

    expect(mockEditor.set).toHaveBeenCalledWith('spring.datasource.username', 'root');
    expect(mockEditor.set).toHaveBeenCalledWith('spring.datasource.password', 'root');
    expect(mockEditor.set).toHaveBeenCalledWith(
      'spring.datasource.url',
      expect.stringContaining('localhost')
    );
    expect(mockEditor.set).toHaveBeenCalledWith(
      'spring.datasource.url',
      expect.stringContaining('3306')
    );
    expect(mockEditor.set).toHaveBeenCalledWith('spring.data.redis.host', 'localhost');
    expect(mockEditor.set).toHaveBeenCalledWith('spring.data.redis.port', '6379');
  });

  it('should set redis properties', () => {
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    createSpringBootServer(baseAnswers);

    expect(mockEditor.set).toHaveBeenCalledWith('spring.data.redis.host', 'redis-host');
    expect(mockEditor.set).toHaveBeenCalledWith('spring.data.redis.port', '6380');
  });

  it('should set mybatis-plus properties', () => {
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    createSpringBootServer(baseAnswers);

    expect(mockEditor.set).toHaveBeenCalledWith('mybatis-plus.mapper-locations', 'classpath:mappers/*.xml');
    expect(mockEditor.set).toHaveBeenCalledWith('mybatis-plus.type-aliases-package', 'com.TinyPro.entity.po');
    expect(mockEditor.set).toHaveBeenCalledWith('mybatis-plus.configuration.map-underscore-to-camel-case', 'true');
  });

  it('should set JPA properties', () => {
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    createSpringBootServer(baseAnswers);

    expect(mockEditor.set).toHaveBeenCalledWith('spring.jpa.hibernate.ddl-auto', 'update');
    expect(mockEditor.set).toHaveBeenCalledWith('spring.jpa.database-platform', 'org.hibernate.dialect.MySQL8Dialect');
  });

  it('should set JWT secret', () => {
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    createSpringBootServer(baseAnswers);

    expect(mockEditor.set).toHaveBeenCalledWith('jwt.secret', '0Zi4SA==');
  });

  it('should build JDBC URL with correct format', () => {
    mockExistsSync.mockReturnValue(true);
    const mockEditor = { set: vi.fn(), save: vi.fn() };
    mockCreateEditor.mockReturnValue(mockEditor as any);

    createSpringBootServer(baseAnswers);

    const urlCall = mockEditor.set.mock.calls.find(
      (call: any[]) => call[0] === 'spring.datasource.url'
    );
    expect(urlCall).toBeDefined();
    const url = urlCall![1];
    expect(url).toMatch(/^jdbc:mysql:\/\//);
    expect(url).toContain('allowMultiQueries=true');
    expect(url).toContain('useUnicode=true');
    expect(url).toContain('useSSL=false');
  });
});
