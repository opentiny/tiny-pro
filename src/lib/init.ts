import { logs } from '@opentiny/cli-devkit';
import { getProjectInfo } from './init/questions';
import { createProjectSync } from './init/project';

export { getProjectInfo } from './init/questions';
export { objToEnv } from './init/env-config';
export { packageJsonProcess } from './init/package-json';
export { createLowcodeDesignerSync, createServerSync, createProjectSync, installDependencies } from './init/project';

const log = logs('tiny-toolkit-pro');

export default async () => {
  let projectInfo;

  try {
    projectInfo = await getProjectInfo();
    await createProjectSync(projectInfo);
  } catch (e) {
    log.error(e);
    log.error('项目模板创建失败');
    return;
  }
  log.info('初始化成功，请运行npm i或tiny i 安装依赖');
};
