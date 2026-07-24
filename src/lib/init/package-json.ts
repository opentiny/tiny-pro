import * as path from 'path';
import { logs } from '@opentiny/cli-devkit';
import { existsSync, rmSync } from 'fs';
import {
  buildCommand,
  buildConfigs,
  BuildTool,
  devCommand,
  devDependencies,
  removedCommand,
  removeDependencies,
} from '../interfaces';

const log = logs('tiny-toolkit-pro');

const matchByPattern = (pattern: RegExp, items: string[]) =>
  items.filter((item) => pattern.test(item));

const removeMatchingDeps = (
  deps: (string | RegExp)[],
  target: Record<string, unknown>
) => {
  deps.forEach((dep) => {
    if (typeof dep === 'string') {
      if (target[dep]) {
        target[dep] = undefined;
      }
      return;
    }
    if (dep instanceof RegExp) {
      matchByPattern(dep, Object.keys(target)).forEach((key) => {
        if (target[key]) {
          target[key] = undefined;
        }
      });
    }
  });
};

const removeDevDeps = (
  buildTool: BuildTool,
  packages: Record<string, string | Record<string, string | boolean>>
) => {
  removeMatchingDeps(
    devDependencies[buildTool],
    packages.devDependencies as Record<string, unknown>
  );
  removeMatchingDeps(
    removeDependencies[buildTool],
    packages.dependencies as Record<string, unknown>
  );
};

const replaceScript = (
  packages: Record<string, string | Record<string, string | boolean>>,
  name: string,
  command: string | undefined
) => {
  packages.scripts[name] = command;
};

const removeObsoleteScripts = (
  packages: Record<string, string | Record<string, string | boolean>>
) => {
  removedCommand.forEach((script) =>
    replaceScript(packages, script, undefined)
  );
};

const applyBuildToolScripts = (
  buildTool: BuildTool,
  packages: Record<string, string | Record<string, string | boolean>>
) => {
  replaceScript(packages, 'build', buildCommand[buildTool]);
  replaceScript(packages, 'start', devCommand[buildTool]);
};

const removeBuildConfigFiles = (buildTool: BuildTool, currentPath: string) => {
  const paths = buildConfigs[buildTool]
    .filter((removedPath) => existsSync(path.join(currentPath, removedPath)))
    .map((p) => path.join(currentPath, p));

  if (!paths.length) {
    return;
  }

  let willRemovePath = '';
  try {
    paths.forEach((removePath) => {
      willRemovePath = removePath;
      rmSync(removePath, { recursive: true, force: true });
    });
  } catch {
    log.error(`删除${willRemovePath}错误`);
  }
};

export const packageJsonProcess = (
  buildTool: BuildTool,
  packages: Record<string, string | Record<string, string | boolean>>,
  currentPath: string
) => {
  removeDevDeps(buildTool, packages);
  removeObsoleteScripts(packages);
  applyBuildToolScripts(buildTool, packages);

  return () => removeBuildConfigFiles(buildTool, currentPath);
};
