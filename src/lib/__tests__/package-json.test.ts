import * as path from 'path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BuildTool } from '../interfaces';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  rmSync: vi.fn(),
}));

vi.mock('@opentiny/cli-devkit', () => ({
  logs: () => ({
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  }),
}));

import { existsSync, rmSync } from 'fs';
import { packageJsonProcess } from '../init/package-json';

const mockExistsSync = vi.mocked(existsSync);
const mockRmSync = vi.mocked(rmSync);

describe('packageJsonProcess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const basePackages = () => ({
    name: 'test',
    description: 'test project',
    scripts: {
      build: 'webpack --config webpack.config.js',
      start: 'webpack-dev-server',
      dev: 'vite',
      'dev:wp': 'webpack-dev-server',
      'build:wp': 'webpack build',
      'dev:rp': 'rspack serve',
      'build:rp': 'rspack build',
      'dev:fr': 'farm',
      'build:fr': 'farm build',
    },
    devDependencies: {
      vite: '^5.0.0',
      '@vitejs/plugin-vue': '^4.0.0',
      'vite-plugin-mock': '^2.0.0',
      webpack: '^5.0.0',
      'webpack-cli': '^5.0.0',
      'webpack-dev-server': '^4.0.0',
      '@rspack/cli': '^0.3.0',
      '@rspack/core': '^0.3.0',
      '@farmfe/core': '^1.0.0',
      'style-resources-loader': '^1.0.0',
      'vue-style-loader': '^4.0.0',
    },
    dependencies: {
      vue: '^3.0.0',
      'style-resources-loader': '^1.0.0',
      'vue-style-loader': '^4.0.0',
    },
  });

  it('should remove obsolete scripts', () => {
    const packages = basePackages();
    packageJsonProcess(BuildTool.Vite, packages, '/fake/path');

    expect(packages.scripts['dev:wp']).toBeUndefined();
    expect(packages.scripts['build:wp']).toBeUndefined();
    expect(packages.scripts['dev:rp']).toBeUndefined();
    expect(packages.scripts['build:rp']).toBeUndefined();
    expect(packages.scripts['dev']).toBeUndefined();
    expect(packages.scripts['dev:fr']).toBeUndefined();
    expect(packages.scripts['build:fr']).toBeUndefined();
  });

  it('should apply vite build tool scripts', () => {
    const packages = basePackages();
    packageJsonProcess(BuildTool.Vite, packages, '/fake/path');

    expect(packages.scripts['build']).toBe('vite build --config ./config/vite.config.prod.ts');
    expect(packages.scripts['start']).toBe('vite --config ./config/vite.config.dev.ts --port 3031');
  });

  it('should apply webpack build tool scripts', () => {
    const packages = basePackages();
    packageJsonProcess(BuildTool.Webpack, packages, '/fake/path');

    expect(packages.scripts['build']).toBe('webpack --config webpack.config.js');
    expect(packages.scripts['start']).toBe('webpack-dev-server --progress --config webpack.config.js');
  });

  it('should apply rspack build tool scripts', () => {
    const packages = basePackages();
    packageJsonProcess(BuildTool.Rspack, packages, '/fake/path');

    expect(packages.scripts['build']).toBe('rspack build');
    expect(packages.scripts['start']).toBe('rspack serve');
  });

  it('should apply farm build tool scripts', () => {
    const packages = basePackages();
    packageJsonProcess(BuildTool.Farm, packages, '/fake/path');

    expect(packages.scripts['build']).toBe('farm build');
    expect(packages.scripts['start']).toBe('farm');
  });

  it('should remove vite devDependencies when buildTool is webpack', () => {
    const packages = basePackages();
    packageJsonProcess(BuildTool.Webpack, packages, '/fake/path');

    expect(packages.devDependencies['vite']).toBeUndefined();
    expect(packages.devDependencies['@vitejs/plugin-vue']).toBeUndefined();
    expect(packages.devDependencies['vite-plugin-mock']).toBeUndefined();
  });

  it('should remove webpack devDependencies when buildTool is vite', () => {
    const packages = basePackages();
    packageJsonProcess(BuildTool.Vite, packages, '/fake/path');

    expect(packages.devDependencies['webpack']).toBeUndefined();
    expect(packages.devDependencies['webpack-cli']).toBeUndefined();
    expect(packages.devDependencies['webpack-dev-server']).toBeUndefined();
    expect(packages.devDependencies['@rspack/cli']).toBeUndefined();
    expect(packages.devDependencies['@rspack/core']).toBeUndefined();
    expect(packages.devDependencies['@farmfe/core']).toBeUndefined();
  });

  it('should remove style-resources-loader and vue-style-loader from dependencies when buildTool is vite', () => {
    const packages = basePackages();
    packageJsonProcess(BuildTool.Vite, packages, '/fake/path');

    expect(packages.dependencies['style-resources-loader']).toBeUndefined();
    expect(packages.dependencies['vue-style-loader']).toBeUndefined();
  });

  it('should return a function that removes build config files', () => {
    mockExistsSync.mockReturnValue(true);
    const packages = basePackages();
    const removeConfigFiles = packageJsonProcess(BuildTool.Vite, packages, '/fake/path');

    removeConfigFiles();

    expect(mockRmSync).toHaveBeenCalled();
    const calls = mockRmSync.mock.calls.map((call) => call[0]);
    expect(calls).toContain(path.join('/fake/path', 'webpack.config.js'));
    expect(calls).toContain(path.join('/fake/path', 'rspack.config.js'));
    expect(calls).toContain(path.join('/fake/path', 'farm.config.ts'));
  });

  it('should not remove build config files if they do not exist', () => {
    mockExistsSync.mockReturnValue(false);
    const packages = basePackages();
    const removeConfigFiles = packageJsonProcess(BuildTool.Vite, packages, '/fake/path');

    removeConfigFiles();

    expect(mockRmSync).not.toHaveBeenCalled();
  });

  it('should handle regex pattern matching for devDependencies removal', () => {
    const packages = basePackages();
    packageJsonProcess(BuildTool.Rspack, packages, '/fake/path');

    expect(packages.devDependencies['vite']).toBeUndefined();
    expect(packages.devDependencies['@vitejs/plugin-vue']).toBeUndefined();
    expect(packages.devDependencies['vite-plugin-mock']).toBeUndefined();
    expect(packages.devDependencies['webpack']).toBeUndefined();
    expect(packages.devDependencies['webpack-cli']).toBeUndefined();
    expect(packages.devDependencies['webpack-dev-server']).toBeUndefined();
    expect(packages.devDependencies['@farmfe/core']).toBeUndefined();
  });
});
