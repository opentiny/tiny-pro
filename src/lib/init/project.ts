import * as path from 'path';
import * as dotenv from 'dotenv';
import { copySync } from 'fs-extra';
import chalk from 'chalk';
import spawn from 'cross-spawn';
import { cliConfig, logs, fs } from '@opentiny/cli-devkit';
import {
  LowcodeEngine,
  ProjectInfo,
  ServerFrameworks,
  VueVersion,
} from '../interfaces';
import utils from '../utils';
import { createSpringBootServer } from './server-springboot';
import { createNestJsServer } from './server-nestjs';
import { packageJsonProcess } from './package-json';

const log = logs('tiny-toolkit-pro');

export const createLowcodeDesignerSync = (answers: ProjectInfo) => {
  const { name, lowcodeEngine } = answers;
  if (lowcodeEngine !== LowcodeEngine.Include) {
    return;
  }

  const lowcodeFrom = utils.getTemplatePath(lowcodeEngine);
  const lowcodeTo = utils.getDistPath(`${name}/${lowcodeEngine}`);

  copySync(lowcodeFrom, lowcodeTo);
  log.success('低代码设计器模板复制成功');
};

export const createServerSync = (answers: ProjectInfo) => {
  const { serverFramework } = answers;

  if (serverFramework === ServerFrameworks.SpringBoot) {
    createSpringBootServer(answers);
  } else if (serverFramework === ServerFrameworks.NestJs) {
    createNestJsServer(answers);
  }
};

const configurePackageJson = (answers: ProjectInfo, to: string) => {
  const { description, name, buildTool, serverFramework } = answers;

  if (serverFramework !== ServerFrameworks.NestJs) {
    return;
  }

  try {
    const packageJsonPath = path.join(to, 'package.json');
    let packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, { encoding: 'utf8' })
    );
    packageJson = { ...packageJson, name, description };
    const remove = packageJsonProcess(buildTool, packageJson, to);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), {
      encoding: 'utf8',
    });
    remove();
  } catch (e) {
    log.error(e);
    log.error('配置项目信息创建失败');
  }
};

const configureEnvFile = (answers: ProjectInfo, to: string) => {
  const { serverConfirm, lowcodeEngine } = answers;

  try {
    const envPath = path.join(to, 'dev.env');
    const envContent = fs.readFileSync(envPath, { encoding: 'utf8' });
    let updatedEnvContent = envContent;

    if (!serverConfirm) {
      const envConfig = dotenv.parse(envContent);
      delete envConfig.VITE_MOCK_IGNORE;
      updatedEnvContent = Object.keys(envConfig)
        .map((key) => `${key} = ${envConfig[key]}`)
        .join('\n');
    }

    const lowcodeEnabled = lowcodeEngine === LowcodeEngine.Include;
    updatedEnvContent = updatedEnvContent.replace(
      /VITE_LOWCODE_DESIGNER_ENABLED=false/,
      `VITE_LOWCODE_DESIGNER_ENABLED=${lowcodeEnabled}`
    );

    fs.writeFileSync(envPath, updatedEnvContent);
    log.success(`低代码设计器环境变量已设置为: ${lowcodeEnabled}`);
  } catch (e) {
    log.error(e);
    log.error('配置环境变量失败');
    log.info('请手动配置env信息');
  }
};

export const createProjectSync = (answers: ProjectInfo) => {
  const { name, serverConfirm } = answers;
  const templatePath = VueVersion.Vue3;
  const from = utils.getTemplatePath(templatePath);
  const to = utils.getDistPath(serverConfirm ? `${name}/web` : name);

  fs.copyTpl(from, to);

  configurePackageJson(answers, to);
  configureEnvFile(answers, to);

  if (serverConfirm) {
    createServerSync(answers);
  }

  createLowcodeDesignerSync(answers);
};

const runNpmInstall = (cwd: string, label: string) => {
  log.info(`正在安装${label} npm 依赖，安装过程需要几十秒，请耐心等待...`);
  const result = spawn.sync('npm', ['install'], {
    cwd,
    stdio: 'inherit',
  });
  if (result.status === 0) {
    log.success(`${label} npm 依赖安装成功`);
  } else {
    throw new Error(result.error);
  }
};

const printSuccessMessage = (answers: ProjectInfo) => {
  const prefix = cliConfig.getBinName();
  const { name, serverFramework, serverConfirm, lowcodeEngine } = answers;

  /* prettier-ignore-start */
  console.log(
    chalk.yellow(
      '\n--------------------初始化成功,请按下面提示进行操作--------------------\n'
    )
  );

  if (serverConfirm) {
    console.log(
      chalk.green(
        `${chalk.yellow(
          `$ cd ${name}/web && npm run start`
        )}     # 开启web开发环境`
      )
    );
    console.log(
      chalk.green(
        `${chalk.yellow(
          serverFramework === ServerFrameworks.SpringBoot
            ? `请查看 ${name}/${serverFramework}/README_CN.md `
            : `$ cd ${name}/${serverFramework} && npm run dev`
        )}    # 开启server开发环境`
      )
    );
  } else {
    console.log(
      chalk.green(
        `${chalk.yellow(
          `$ cd ${name} && ${prefix} start`
        )}         # 可一键开启项目开发环境`
      )
    );
  }

  if (lowcodeEngine && lowcodeEngine === LowcodeEngine.Include) {
    console.log(
      chalk.green(
        `${chalk.yellow(
          `$ cd ${name}/${lowcodeEngine} && npm run dev`
        )}  # 开启低代码设计器开发环境`
      )
    );
  }

  console.log(
    chalk.green(
      `${chalk.yellow(`$ ${prefix} help`)}          # 可查看当前套件的详细帮助`
    )
  );
  console.log(
    chalk.green(
      `\n建议将现有初始化的代码提交一次到master分支, 方便后续切换到 ${chalk.yellow(
        'daily/x.y.z'
      )} 分支进行开发`
    )
  );
  console.log(
    chalk.yellow(
      '\n-------------------- 技术支持：官方小助手微信opentiny-official --------------------\n'
    )
  );
  /* prettier-ignore-end */
};

export const installDependencies = (answers: ProjectInfo) => {
  const { name, serverFramework, serverConfirm, lowcodeEngine } = answers;

  if (serverConfirm && serverFramework === ServerFrameworks.EggJs) {
    runNpmInstall(`${name}/${serverFramework}/`, '服务端');
  }

  runNpmInstall(serverConfirm ? `${name}/web` : `${name}/`, '客户端');

  if (lowcodeEngine && lowcodeEngine === LowcodeEngine.Include) {
    runNpmInstall(`${name}/${lowcodeEngine}/`, '低代码设计器');
  }

  printSuccessMessage(answers);
};
