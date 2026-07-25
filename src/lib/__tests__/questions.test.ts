import { describe, it, expect, vi } from 'vitest';
import inquirer from 'inquirer';
import { BuildTool, LowcodeEngine, ServerFrameworks } from '../interfaces';

vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

const mockPrompt = vi.mocked(inquirer.prompt);

describe('getProjectInfo', () => {
  it('should return project info from inquirer prompt', async () => {
    const mockAnswers = {
      name: 'my-project',
      description: 'test project',
      framework: 'tinyvue',
      serverFramework: ServerFrameworks.NestJs,
      lowcodeEngine: LowcodeEngine.Skip,
      buildTool: BuildTool.Vite,
      serverConfirm: true,
      redisHost: 'localhost',
      redisPort: 6379,
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'testdb',
      username: 'root',
      password: 'secret',
    };
    mockPrompt.mockResolvedValue(mockAnswers);

    const { getProjectInfo } = await import('../init/questions');
    const result = await getProjectInfo();

    expect(result).toEqual(mockAnswers);
    expect(mockPrompt).toHaveBeenCalledOnce();
  });

  it('should pass question collection to inquirer prompt', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    expect(questions.length).toBeGreaterThan(0);

    const nameQuestion = questions.find((q: any) => q.name === 'name');
    expect(nameQuestion).toBeDefined();
    expect(nameQuestion.default).toBe('tiny-pro');
    expect(nameQuestion.type).toBe('input');
  });

  it('should have serverFramework question with correct choices', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    const serverQ = questions.find((q: any) => q.name === 'serverFramework');
    expect(serverQ).toBeDefined();
    expect(serverQ.choices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: ServerFrameworks.SpringBoot }),
        expect.objectContaining({ value: ServerFrameworks.NestJs }),
        expect.objectContaining({ value: ServerFrameworks.Skip }),
      ])
    );
  });

  it('should have buildTool question with correct choices', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    const buildQ = questions.find((q: any) => q.name === 'buildTool');
    expect(buildQ).toBeDefined();
    expect(buildQ.choices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: BuildTool.Vite }),
        expect.objectContaining({ value: BuildTool.Webpack }),
        expect.objectContaining({ value: BuildTool.Rspack }),
        expect.objectContaining({ value: BuildTool.Farm }),
      ])
    );
  });

  it('should have lowcodeEngine question with correct choices', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    const lowcodeQ = questions.find((q: any) => q.name === 'lowcodeEngine');
    expect(lowcodeQ).toBeDefined();
    expect(lowcodeQ.choices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: LowcodeEngine.Include }),
        expect.objectContaining({ value: LowcodeEngine.Skip }),
      ])
    );
  });

  it('should validate name is not empty', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    const nameQ = questions.find((q: any) => q.name === 'name');
    expect(nameQ.validate('')).toBe(false);
    expect(nameQ.validate('my-project')).toBe(true);
  });

  it('should validate database name is not empty', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    const dbQ = questions.find((q: any) => q.name === 'database');
    expect(dbQ.validate('')).toBe(false);
    expect(dbQ.validate('mydb')).toBe(true);
  });

  it('should conditionally show serverFramework when framework is tinyvue', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    const serverQ = questions.find((q: any) => q.name === 'serverFramework');
    expect(serverQ.when({ framework: 'tinyvue' })).toBe(true);
    expect(serverQ.when({ framework: 'react' })).toBe(false);
  });

  it('should conditionally show serverConfirm when framework is tinyvue and serverFramework is not Skip', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    const confirmQ = questions.find((q: any) => q.name === 'serverConfirm');
    expect(confirmQ.when({ framework: 'tinyvue', serverFramework: ServerFrameworks.NestJs })).toBe(true);
    expect(confirmQ.when({ framework: 'tinyvue', serverFramework: ServerFrameworks.Skip })).toBe(false);
    expect(confirmQ.when({ framework: 'react', serverFramework: ServerFrameworks.NestJs })).toBe(false);
  });

  it('should conditionally show redis questions when serverConfirm is true', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    const redisHostQ = questions.find((q: any) => q.name === 'redisHost');
    const redisPortQ = questions.find((q: any) => q.name === 'redisPort');
    expect(redisHostQ.when({ serverConfirm: true })).toBe(true);
    expect(redisHostQ.when({ serverConfirm: false })).toBe(false);
    expect(redisPortQ.when({ serverConfirm: true })).toBe(true);
    expect(redisPortQ.when({ serverConfirm: false })).toBe(false);
  });

  it('should conditionally show database questions based on dialect and host', async () => {
    mockPrompt.mockResolvedValue({ name: 'test' });

    const { getProjectInfo } = await import('../init/questions');
    await getProjectInfo();

    const questions = mockPrompt.mock.calls[0][0];
    const dialectQ = questions.find((q: any) => q.name === 'dialect');
    const hostQ = questions.find((q: any) => q.name === 'host');
    const portQ = questions.find((q: any) => q.name === 'port');

    expect(dialectQ.when({ serverConfirm: true })).toBeTruthy();
    expect(dialectQ.when({ serverConfirm: false })).toBe(false);
    expect(hostQ.when({ dialect: 'mysql' })).toBeTruthy();
    expect(hostQ.when({ dialect: '' })).toBeFalsy();
    expect(portQ.when({ host: 'localhost' })).toBeTruthy();
    expect(portQ.when({ host: undefined })).toBeFalsy();
  });
});
