import inquirer, { QuestionCollection } from 'inquirer';
import {
  BuildTool,
  LowcodeEngine,
  ProjectInfo,
  ServerFrameworks,
} from '../interfaces';

const VUE_TEMPLATE_PATH = 'tinyvue';
const DEFAULT_PROJECT_NAME = 'tiny-pro';

export const getProjectInfo = (): Promise<ProjectInfo> => {
  const question: QuestionCollection<ProjectInfo> = [
    {
      type: 'input',
      name: 'name',
      message: '请输入项目名称：',
      default: DEFAULT_PROJECT_NAME,
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
      name: 'lowcodeEngine',
      message: '是否集成低代码设计器：',
      choices: [
        { name: '是，集成低代码设计器', value: LowcodeEngine.Include },
        { name: '否，暂不集成', value: LowcodeEngine.Skip },
      ],
      default: LowcodeEngine.Skip,
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
