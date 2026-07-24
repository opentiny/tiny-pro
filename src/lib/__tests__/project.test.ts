import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LowcodeEngine, ServerFrameworks, BuildTool, VueVersion } from '../interfaces';

vi.mock('fs-extra', () => ({
  copySync: vi.fn(),
}));

vi.mock('cross-spawn', () => ({
  default: {
    sync: vi.fn(),
  },
}));

vi.mock('dotenv', () => ({
  parse: vi.fn(),
}));

vi.mock('@opentiny/cli-devkit', () => ({
  cliConfig: {
    getBinName: vi.fn(() => 'tiny'),
  },
  logs: () => ({
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  }),
  fs: {
    copyTpl: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

vi.mock('../utils', () => ({
  default: {
    getTemplatePath: vi.fn((p) => `/template/${p}`),
    getDistPath: vi.fn((p) => `/dist/${p}`),
    generateNames: vi.fn(),
    setModuleCache: vi.fn(),
  },
}));

vi.mock('../init/server-springboot', () => ({
  createSpringBootServer: vi.fn(),
}));

vi.mock('../init/server-nestjs', () => ({
  createNestJsServer: vi.fn(),
}));

vi.mock('../init/package-json', () => ({
  packageJsonProcess: vi.fn(() => vi.fn()),
}));

import { copySync } from 'fs-extra';
import spawn from 'cross-spawn';
import * as dotenv from 'dotenv';
import { cliConfig, fs as cliFs } from '@opentiny/cli-devkit';
import utils from '../utils';
import { createSpringBootServer } from '../init/server-springboot';
import { createNestJsServer } from '../init/server-nestjs';
import {
  createLowcodeDesignerSync,
  createServerSync,
  createProjectSync,
  installDependencies,
} from '../init/project';

const mockCopySync = vi.mocked(copySync);
const mockSpawnSync = vi.mocked(spawn.sync);
const mockDotnetParse = vi.mocked(dotenv.parse);
const mockCliFsReadFile = vi.mocked(cliFs.readFileSync);
const mockCliFsWriteFile = vi.mocked(cliFs.writeFileSync);
const mockCreateSpringBoot = vi.mocked(createSpringBootServer);
const mockCreateNestJs = vi.mocked(createNestJsServer);

describe('createLowcodeDesignerSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not copy when lowcodeEngine is not Include', () => {
    createLowcodeDesignerSync({
      name: 'my-project',
      lowcodeEngine: LowcodeEngine.Skip,
    } as any);

    expect(mockCopySync).not.toHaveBeenCalled();
  });

  it('should copy lowcode template when lowcodeEngine is Include', () => {
    createLowcodeDesignerSync({
      name: 'my-project',
      lowcodeEngine: LowcodeEngine.Include,
    } as any);

    expect(mockCopySync).toHaveBeenCalledWith(
      `/template/${LowcodeEngine.Include}`,
      `/dist/my-project/${LowcodeEngine.Include}`
    );
  });
});

describe('createServerSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call createSpringBootServer when serverFramework is SpringBoot', () => {
    const answers = { serverFramework: ServerFrameworks.SpringBoot } as any;
    createServerSync(answers);

    expect(mockCreateSpringBoot).toHaveBeenCalledWith(answers);
    expect(mockCreateNestJs).not.toHaveBeenCalled();
  });

  it('should call createNestJsServer when serverFramework is NestJs', () => {
    const answers = { serverFramework: ServerFrameworks.NestJs } as any;
    createServerSync(answers);

    expect(mockCreateNestJs).toHaveBeenCalledWith(answers);
    expect(mockCreateSpringBoot).not.toHaveBeenCalled();
  });

  it('should not call any server creator for other frameworks', () => {
    const answers = { serverFramework: ServerFrameworks.Skip } as any;
    createServerSync(answers);

    expect(mockCreateSpringBoot).not.toHaveBeenCalled();
    expect(mockCreateNestJs).not.toHaveBeenCalled();
  });
});

describe('createProjectSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCliFsReadFile.mockReturnValue('VITE_MOCK_IGNORE=true\nVITE_LOWCODE_DESIGNER_ENABLED=false\n');
    mockDotnetParse.mockReturnValue({
      VITE_MOCK_IGNORE: 'true',
      VITE_LOWCODE_DESIGNER_ENABLED: 'false',
    });
  });

  it('should copy Vue3 template to dist path', () => {
    createProjectSync({
      name: 'my-project',
      serverConfirm: false,
      lowcodeEngine: LowcodeEngine.Skip,
      serverFramework: ServerFrameworks.Skip,
    } as any);

    expect(cliFs.copyTpl).toHaveBeenCalledWith(
      `/template/${VueVersion.Vue3}`,
      `/dist/my-project`
    );
  });

  it('should copy to web subdirectory when serverConfirm is true', () => {
    createProjectSync({
      name: 'my-project',
      serverConfirm: true,
      lowcodeEngine: LowcodeEngine.Skip,
      serverFramework: ServerFrameworks.NestJs,
    } as any);

    expect(cliFs.copyTpl).toHaveBeenCalledWith(
      `/template/${VueVersion.Vue3}`,
      `/dist/my-project/web`
    );
  });

  it('should call createServerSync when serverConfirm is true', () => {
    createProjectSync({
      name: 'my-project',
      serverConfirm: true,
      lowcodeEngine: LowcodeEngine.Skip,
      serverFramework: ServerFrameworks.NestJs,
    } as any);

    expect(mockCreateNestJs).toHaveBeenCalled();
  });

  it('should not call createServerSync when serverConfirm is false', () => {
    createProjectSync({
      name: 'my-project',
      serverConfirm: false,
      lowcodeEngine: LowcodeEngine.Skip,
      serverFramework: ServerFrameworks.Skip,
    } as any);

    expect(mockCreateSpringBoot).not.toHaveBeenCalled();
    expect(mockCreateNestJs).not.toHaveBeenCalled();
  });

  it('should call createLowcodeDesignerSync when lowcodeEngine is Include', () => {
    createProjectSync({
      name: 'my-project',
      serverConfirm: false,
      lowcodeEngine: LowcodeEngine.Include,
      serverFramework: ServerFrameworks.Skip,
    } as any);

    expect(mockCopySync).toHaveBeenCalledWith(
      `/template/${LowcodeEngine.Include}`,
      `/dist/my-project/${LowcodeEngine.Include}`
    );
  });

  it('should configure env file and set lowcode enabled to true', () => {
    createProjectSync({
      name: 'my-project',
      serverConfirm: true,
      lowcodeEngine: LowcodeEngine.Include,
      serverFramework: ServerFrameworks.NestJs,
    } as any);

    expect(mockCliFsWriteFile).toHaveBeenCalled();
    const writeCall = mockCliFsWriteFile.mock.calls.find(
      (call) => typeof call[1] === 'string' && call[1].includes('VITE_LOWCODE_DESIGNER_ENABLED=true')
    );
    expect(writeCall).toBeDefined();
  });

  it('should configure env file and keep lowcode disabled when Skip', () => {
    createProjectSync({
      name: 'my-project',
      serverConfirm: true,
      lowcodeEngine: LowcodeEngine.Skip,
      serverFramework: ServerFrameworks.NestJs,
    } as any);

    expect(mockCliFsWriteFile).toHaveBeenCalled();
    const writeCall = mockCliFsWriteFile.mock.calls.find(
      (call) => typeof call[1] === 'string' && call[1].includes('VITE_LOWCODE_DESIGNER_ENABLED=false')
    );
    expect(writeCall).toBeDefined();
  });

  it('should remove VITE_MOCK_IGNORE when serverConfirm is false', () => {
    createProjectSync({
      name: 'my-project',
      serverConfirm: false,
      lowcodeEngine: LowcodeEngine.Skip,
      serverFramework: ServerFrameworks.Skip,
    } as any);

    expect(mockDotnetParse).toHaveBeenCalled();
    expect(mockCliFsWriteFile).toHaveBeenCalled();
    const writeCall = mockCliFsWriteFile.mock.calls.find(
      (call) => typeof call[1] === 'string' && !call[1].includes('VITE_MOCK_IGNORE')
    );
    expect(writeCall).toBeDefined();
  });

  it('should not configure packageJson when serverFramework is not NestJs', () => {
    createProjectSync({
      name: 'my-project',
      serverConfirm: true,
      lowcodeEngine: LowcodeEngine.Skip,
      serverFramework: ServerFrameworks.SpringBoot,
      buildTool: BuildTool.Vite,
    } as any);

    expect(mockCliFsReadFile).not.toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.anything()
    );
  });
});

describe('installDependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpawnSync.mockReturnValue({ status: 0 } as any);
  });

  it('should run npm install for client when serverConfirm is false', () => {
    installDependencies({
      name: 'my-project',
      serverConfirm: false,
      serverFramework: ServerFrameworks.Skip,
      lowcodeEngine: LowcodeEngine.Skip,
    } as any);

    expect(mockSpawnSync).toHaveBeenCalledWith('npm', ['install'], expect.objectContaining({
      cwd: 'my-project/',
    }));
  });

  it('should run npm install for web when serverConfirm is true', () => {
    installDependencies({
      name: 'my-project',
      serverConfirm: true,
      serverFramework: ServerFrameworks.NestJs,
      lowcodeEngine: LowcodeEngine.Skip,
    } as any);

    expect(mockSpawnSync).toHaveBeenCalledWith('npm', ['install'], expect.objectContaining({
      cwd: 'my-project/web',
    }));
  });

  it('should run npm install for server when serverFramework is EggJs and serverConfirm is true', () => {
    installDependencies({
      name: 'my-project',
      serverConfirm: true,
      serverFramework: ServerFrameworks.EggJs,
      lowcodeEngine: LowcodeEngine.Skip,
    } as any);

    expect(mockSpawnSync).toHaveBeenCalledWith('npm', ['install'], expect.objectContaining({
      cwd: 'my-project/eggJs/',
    }));
  });

  it('should run npm install for lowcode designer when lowcodeEngine is Include', () => {
    installDependencies({
      name: 'my-project',
      serverConfirm: false,
      serverFramework: ServerFrameworks.Skip,
      lowcodeEngine: LowcodeEngine.Include,
    } as any);

    expect(mockSpawnSync).toHaveBeenCalledWith('npm', ['install'], expect.objectContaining({
      cwd: 'my-project/lowcode-designer/',
    }));
  });

  it('should throw error when npm install fails', () => {
    mockSpawnSync.mockReturnValue({ status: 1, error: new Error('npm install failed') } as any);

    expect(() => {
      installDependencies({
        name: 'my-project',
        serverConfirm: false,
        serverFramework: ServerFrameworks.Skip,
        lowcodeEngine: LowcodeEngine.Skip,
      } as any);
    }).toThrow('npm install failed');
  });
});
