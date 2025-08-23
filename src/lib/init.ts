import { parse, stringify } from 'yaml';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { copySync } from 'fs-extra';
import chalk from 'chalk';
import spawn from 'cross-spawn';
import inquirer, { QuestionCollection } from 'inquirer';
import { cliConfig, logs, fs } from '@opentiny/cli-devkit';
import {createEditor} from 'properties-parser';
import {
  buildCommand,
  buildConfigs,
  BuildTool,
  devCommand,
  devDependencies,
  ProjectInfo,
  removedCommand,
  removeDependencies,
  ServerFrameworks,
  VueVersion,
} from './interfaces';
import utils from './utils';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs';

const log = logs('tiny-toolkit-pro');
const VUE_TEMPLATE_PATH = 'tinyvue';
const DEFAULT_PROJECT_NAME = 'tiny-pro';

/**
 * 询问创建项目的描述，使用的技术栈
 *
 * @returns object { description: 项目描述,framework: 框架, name: 项目名称 ,serverFramework:使用技术栈, dialect：数据库，DB_host:数据库地址，DB_port:数据库端口，database：数据库名称，username：数据库用户名，password：数据库密码，}
 */
const getProjectInfo = (): Promise<ProjectInfo> => {
  const question: QuestionCollection<ProjectInfo> = [
    {
      type: 'input',
      name: 'name',
      message: '请输入项目名称：',
      default: DEFAULT_PROJECT_NAME,
      // 必填校验
      validate: (input: string) => Boolean(input),
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入项目描述：',
      default: '基于TinyPro套件创建的中后台系统',
    },
    {
      type: 'list',
      name: 'framework',
      message: '请选择您希望使用的客户端技术栈：',
      choices: [{ name: 'vue', value: VUE_TEMPLATE_PATH }],
      default: VUE_TEMPLATE_PATH,
      prefix: '*',
    },
    {
      type: 'list',
      name: 'serverFramework',
      message: '请选择您希望使用的服务端技术栈：',
      choices: [
        // { name: 'Egg.js', value: ServerFrameworks.EggJs },
        { name: 'SpringBoot', value: ServerFrameworks.SpringBoot },
        { name: 'Nest.js', value: ServerFrameworks.NestJs },
        { name: '暂不配置', value: ServerFrameworks.Skip },
      ],
      default: ServerFrameworks.NestJs,
      prefix: '*',
      when: (answers) => answers.framework === VUE_TEMPLATE_PATH,
    },
    {
      type: 'list',
      name: 'buildTool',
      message: '请选择你想要的构建工具: ',
      choices: [
        { name: 'Vite', value: BuildTool.Vite },
        { name: 'Webpack', value: BuildTool.Webpack },
        { name: 'Rspack', value: BuildTool.Rspack },
        { name: 'Farm', value: BuildTool.Farm },
      ],
      default: BuildTool.Vite,
      prefix: '*',
    },
    {
      type: 'list',
      name: 'serverConfirm',
      message:
        '请确保已安装数据库服务（参考文档 https://www.opentiny.design/tiny-cli/docs/toolkits/pro#database）：',
      choices: [
        { name: '已完成数据库服务安装，开始配置', value: true },
        { name: '暂不配置服务端', value: false },
      ],
      prefix: '*',
      when: (answers) =>
        answers.framework === VUE_TEMPLATE_PATH &&
        answers.serverFramework !== ServerFrameworks.Skip,
    },
    {
      type: 'input',
      name: 'redisHost',
      message: '请输入Redis地址：',
      default: 'localhost',
      prefix: '*',
      when: (answers) => answers.serverConfirm,
    },
    {
      type: 'input',
      name: 'redisPort',
      message: '请输入Redis端口：',
      default: 6379,
      prefix: '*',
      when: (answers) => answers.serverConfirm,
    },
    {
      type: 'list',
      name: 'dialect',
      message: '请选择数据库类型：',
      choices: [
        { name: 'MySql', value: 'mysql' },
        { name: '暂不配置', value: '' },
      ],
      default: 'mysql',
      prefix: '*',
      when: (answers) => answers.serverConfirm,
    },
    {
      type: 'input',
      name: 'host',
      message: '请输入数据库地址：',
      default: 'localhost',
      prefix: '*',
      when: (answers) => answers.dialect,
    },
    {
      type: 'input',
      name: 'port',
      message: '请输入数据库端口：',
      default: 3306,
      prefix: '*',
      when: (answers) => answers.host,
    },
    {
      type: 'input',
      name: 'database',
      message: '请输入数据库名称：',
      prefix: '*',
      validate: (input: string) => Boolean(input),
      when: (answers) => answers.host,
    },
    {
      type: 'input',
      name: 'username',
      message: '请输入登录用户名：',
      default: 'root',
      prefix: '*',
      when: (answers) => answers.host,
    },
    {
      type: 'password',
      name: 'password',
      message: '请输入密码：',
      prefix: '*',
      when: (answers) => answers.host,
    },
  ];
  return inquirer.prompt(question);
};

/**
 * 同步创建服务端项目文件目录、文件
 * @answers 询问客户端问题的选择值
 * @dbAnswers  询问服务端配置的选择值
 */
const createServerSync = (answers: ProjectInfo) => {
  const { name, serverFramework } = answers;
  // 复制服务端相关目录
  const serverFrom = utils.getTemplatePath(`${serverFramework}`);
  const serverTo = utils.getDistPath(`${name}/${serverFramework}`);
  if (serverFramework === ServerFrameworks.SpringBoot) {
    console.log("springboot的服务端配置")
    // 拷贝 SpringBoot 模板代码到目标目录
    copySync(serverFrom, serverTo);

    // ===== 1. 定义统一的配置对象（从用户输入中提取，不写死）=====
    const config = {
      DB_HOST: answers.host ?? 'localhost',
      DB_PORT: Number(answers.port ?? 3306),
      DB_USERNAME: answers.username ?? 'root',
      DB_PASSWORD: answers.password ?? 'root',
      DB_NAME: answers.database ?? 'mydb',
      DB_SYNCHRONIZE: false,
      DB_AUTOLOADENTITIES: true,
      AUTH_SECRET: 'secret',
      REDIS_SECONDS: 7200,
      REDIS_HOST: answers.redisHost ?? 'localhost',
      REDIS_PORT: Number(answers.redisPort ?? 6379),
      EXPIRES_IN: '2h',
      PAGINATION_PAGE: 1,
      PAGINATION_LIMIT: 10,
      SERVER_PORT: 3000, // 可以改为 answers.serverPort || 3000，如果将来要支持动态端口
    };

    // ===== 2. 拷贝模板后，设置 Spring Boot 配置文件路径 =====
    const propertiesFilePath = path.join(
      serverTo,
      'src/main/resources/application.properties'
    );

    if (!existsSync(propertiesFilePath)) {
      log.error(`❌ 未找到 Spring Boot 配置文件：${propertiesFilePath}`);
      return;
    }

if (!existsSync(propertiesFilePath)) {
  log.error(`❌ 未找到 Spring Boot 配置文件：${propertiesFilePath}`);
  return;
}

// ✅ 1. 使用 createEditor 读取 properties 文件
const editor = createEditor(propertiesFilePath);

// ✅ 3. 使用 editor.set(...) 方法逐一设置每一个配置项
editor.set('server.port', config.SERVER_PORT.toString()); // 动态端口

editor.set('spring.datasource.url', `jdbc:mysql://${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}?allowMultiQueries=true&serverTimezone=GMT%2B8&useUnicode=true&characterEncoding=utf8&autoReconnect=true&allowMultiQueries=true&allowPublicKeyRetrieval=true&useSSL=false`);
editor.set('spring.datasource.username', config.DB_USERNAME);
editor.set('spring.datasource.password', config.DB_PASSWORD);
editor.set('spring.datasource.driver-class-name', 'com.mysql.cj.jdbc.Driver');

// HikariCP 配置
editor.set('spring.datasource.hikari.pool-name', 'HikariCPDatasource');
editor.set('spring.datasource.hikari.minimum-idle', '5');
editor.set('spring.datasource.hikari.idle-timeout', '180000');
editor.set('spring.datasource.hikari.maximum-pool-size', '10');
editor.set('spring.datasource.hikari.auto-commit', 'true');
editor.set('spring.datasource.hikari.max-lifetime', '180000');
editor.set('spring.datasource.hikari.connection-timeout', '30000');

// MyBatis-Plus
editor.set('mybatis-plus.mapper-locations', 'classpath:mappers/*.xml');
editor.set('mybatis-plus.type-aliases-package', 'com.TinyPro.entity.po');
editor.set('mybatis-plus.configuration.map-underscore-to-camel-case', 'true');
editor.set('mybatis-plus.configuration.default-enum-type-handler', 'org.apache.ibatis.type.EnumOrdinalTypeHandler');

// JPA (如同时使用)
editor.set('spring.jpa.hibernate.ddl-auto', 'update');
editor.set('spring.jpa.database-platform', 'org.hibernate.dialect.MySQL8Dialect');
editor.set('spring.jpa.properties.hibernate.dialect', 'org.hibernate.dialect.MySQL8Dialect');
editor.set('spring.jpa.properties.hibernate.dialect.storage_engine', 'innodb');
editor.set('spring.jpa.properties.hibernate.globally_quoted_identifiers', 'true');
editor.set('spring.jpa.hibernate.naming.physical-strategy', 'org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl');

// JWT
editor.set('jwt.secret', '0Zi4SA==');

// Redis
editor.set('spring.data.redis.host', config.REDIS_HOST);
editor.set('spring.data.redis.port', config.REDIS_PORT.toString());

// ✅ 4. 保存修改后的内容到原 .properties 文件
editor.save(propertiesFilePath);

log.success(`✅ Spring Boot 配置文件已更新：${propertiesFilePath}`);
  } else if (serverFramework === ServerFrameworks.NestJs) {
    const config = {
      DATABASE_HOST: answers.dialect && (answers.host ?? 'localhost'),
      DATABASE_PORT: answers.dialect && Number(answers.port ?? 3306),
      DATABASE_USERNAME: answers.dialect && (answers.username ?? 'root'),
      DATABASE_PASSWORD: answers.dialect && (answers.password ?? 'root'),
      DATABASE_NAME: answers.dialect && answers.database,
      DATABASE_SYNCHRONIZE: false,
      DATABASE_AUTOLOADENTITIES: true,
      AUTH_SECRET: 'secret',
      REDIS_SECONDS: 7200,
      REDIS_HOST: answers.redisHost ?? 'localhost',
      REDIS_PORT: Number(answers.redisPort ?? 6379),
      EXPIRES_IN: '2h',
      PAGINATION_PAGE: 1,
      PAGINATION_LIMIT: 10,
    };
    const envStr = objToEnv(config);
    const overwriteDockerComposeConfig = {
      // @see https://hub.docker.com/_/mysql
      // This variable is mandatory and specifies the password that will be set for the MySQL root superuser account.
      MYSQL_ROOT_PASSWORD: config.DATABASE_PASSWORD,
      MYSQL_DATABASE: config.DATABASE_NAME,
      MYSQL_USER:
        config.DATABASE_USERNAME === 'root' ? undefined : config.DATABASE_NAME,
      MYSQL_PASSWORD:
        config.DATABASE_USERNAME === 'root'
          ? undefined
          : config.DATABASE_PASSWORD,
    };
    copySync(serverFrom, serverTo);
    writeFileSync(path.join(serverTo, '.env'), envStr);
    const dockerComposeYaml = readFileSync(
      path.join(serverTo, 'docker-compose.yml')
    ).toString();
    const yaml = parse(dockerComposeYaml);
    const { services } = yaml;
    const mysql = services.mysql;
    mysql.environment = overwriteDockerComposeConfig;
    writeFileSync(path.join(serverTo, 'docker-compose.yml'), stringify(yaml));
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const objToEnv = (obj: Record<string, any>) => {
  return Object.entries(obj)
    .map(([key, value]) => {
      const v = typeof value === 'string' ? `'${value}'` : value;
      return [key, '=', v].join(' ');
    })
    .join('\n');
};

const packageJsonProcess = (
  buildTool: BuildTool,
  packages: Record<string, string | Record<string, string | boolean>>,
  currentPath: string
) => {
  const match = (pattern: RegExp, items: Array<string>) => {
    return items.filter((item) => pattern.test(item));
  };
  const removeDeps = () => {
    const devDeps = devDependencies[buildTool];
    devDeps.forEach((devDep) => {
      if (typeof devDep === 'string') {
        packages.devDependencies[devDep] = undefined;
      }
      if (devDep instanceof RegExp) {
        const deps = match(devDep, Object.keys(packages.devDependencies));
        if (!deps.length) {
          return;
        }
        deps.forEach((dep) => {
          if (packages.devDependencies[dep]) {
            packages.devDependencies[dep] = undefined;
          }
        });
      }
    });
    const dependencies = removeDependencies[buildTool];
    dependencies.forEach((dep: string | RegExp) => {
      if (typeof dep === 'string') {
        if (!packages.dependencies[dep]) {
          return;
        }
        packages.dependencies[dep] = undefined;
      }
      if (dep instanceof RegExp) {
        const keys = match(dep, Object.keys(packages.devDependencies));
        keys.forEach((key) => {
          if (!packages.dependencies[key]) {
            return;
          }
          packages.dependencies[key] = undefined;
        });
      }
    });
  };
  const replaceScript = (name: string, command: string | undefined) => {
    packages.scripts[name] = command;
  };
  const removeScripts = () => {
    const scripts = removedCommand;
    scripts.forEach((script) => {
      replaceScript(script, undefined);
    });
  };
  const replaceBuildCommand = () => {
    const command = buildCommand[buildTool];
    replaceScript('build', command);
  };
  const replaceDevCommand = () => {
    const command = devCommand[buildTool];
    replaceScript('start', command);
  };
  const remove = () => {
    const removedPaths = buildConfigs[buildTool];
    const paths = removedPaths
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
  removeDeps();
  removeScripts();
  replaceBuildCommand();
  replaceDevCommand();
  return remove;
};

/**
 * 同步创建客户端项目文件目录、文件
 * @answers 询问客户端问题的选择值
 * @dbAnswers  询问服务端配置的选择值
 */
const createProjectSync = (answers: ProjectInfo) => {
  const { description, name, serverConfirm, buildTool,serverFramework } = answers;
  const templatePath = VueVersion.Vue3;
  // 模板来源目录
  const from = utils.getTemplatePath(templatePath);
  // 复制模板的目标目录
  const to = utils.getDistPath(serverConfirm ? `${name}/web` : name);
  fs.copyTpl(from, to);
  // 将项目名称、描述写入 package.json中
  if (serverFramework ===  ServerFrameworks.NestJs) {
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

  }
  // 如果不对接服务端，全部接口采用mock
  if (!serverConfirm) {
    try {
      const envPath = path.join(to, '.env');
      const envConfig = dotenv.parse(
        fs.readFileSync(envPath, { encoding: 'utf8' })
      );
      delete envConfig.VITE_MOCK_IGNORE;
      const config = Object.keys(envConfig)
        .map((key) => `${key} = ${envConfig[key]}`)
        .join('\n');
      fs.writeFileSync(envPath, config);
    } catch (e) {
      log.error(e);
      log.error('开启mock模式失败');
      log.info('请手动配置env信息');
    }
  } else {
    console.log("执行文件复制及相关配置（ WIP: 后台接口暂未全量完成，部分接口还是使用mock ）")
    // 如果对接服务端，执行文件复制及相关配置（ WIP: 后台接口暂未全量完成，部分接口还是使用mock ）
    createServerSync(answers);
  }
};

// 安装依赖
export const installDependencies = (answers: ProjectInfo) => {
  const prefix = cliConfig.getBinName();
  const { name, serverFramework, serverConfirm } = answers;
  // egg服务端 安装依赖并启动
  if (serverConfirm && serverFramework === ServerFrameworks.EggJs) {
    log.info('正在安装服务端 npm 依赖，安装过程需要几十秒，请耐心等待...');
    const installServiceResult = spawn.sync('npm', ['install'], {
      cwd: `${name}/${serverFramework}/`,
      stdio: 'inherit',
    });
    if (installServiceResult.status === 0) {
      log.success('服务端 npm 依赖安装成功');
    } else {
      throw new Error(installServiceResult.error);
    }
  }
  // npm 依赖安装
  log.info('正在安装客户端 npm 依赖，安装过程需要几十秒，请耐心等待...');
  const installClientResult = spawn.sync('npm', ['install'], {
    cwd: serverConfirm ? `${name}/web` : `${name}/`,
    stdio: 'inherit',
  });
  if (installClientResult.status === 0) {
    log.success('客户端 npm 依赖安装成功');
  } else {
    throw new Error(installClientResult.error);
  }

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
};export default async () => {
  // 拷贝模板到当前目录
  let projectInfo: ProjectInfo;

  try {
    // 创建项目文件夹及文件
    projectInfo = await getProjectInfo();
    createProjectSync(projectInfo);
  } catch (e) {
    log.error(e);
    log.error('项目模板创建失败');
    return;
  }
  log.info('初始化成功，请运行npm i或tiny i 安装依赖');
};
