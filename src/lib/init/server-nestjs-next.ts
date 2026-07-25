import inquirer, { QuestionCollection } from "inquirer";
import { ProjectInfo } from "../interfaces";
import utils from "../utils";
import { writeFileSync } from "fs";
import { objToEnv } from "./env-config";
import { copySync } from "fs-extra";

interface DatabaseConfig {
  /** 数据库主机地址 */
  host: string;
  /** 数据库端口 */
  port: number;
  /** 数据库用户名 */
  user: string;
  /** 数据库密码 */
  password: string;
  /** 数据库名称 */
  dbName: string;
}

interface RedisConfigure {
  /** Redis主机地址 */
  host: string;
  /** Redis端口 */
  port: number;
  /** Redis用户名 */
  user: string;
  /** Redis密码 */
  password: string;
  /** Redis数据库编号 */
  db: number;
}

interface FeatureConfigure {
  /** 预览功能开关 */
  preview: boolean;
}

/**
 * Swagger 文档配置（可选）
 */
interface SwaggerConfigure {
  /** Swagger文档标题 */
  title?: string;
  /** API版本号 */
  version?: string;
  /** Swagger文档描述 */
  description?: string;
}

/**
 * JWT 密钥模式（使用固定密钥）
 */
interface SecretConfigure {
  /** JWT模式:使用密钥 */
  mode: 'secret';
  /** JWT密钥 */
  secret: string;
}

/**
 * JWT 本地密钥文件模式（使用公钥/私钥文件）
 */
interface LocalKeyConfigure {
  /** JWT模式:使用本地密钥文件 */
  mode: 'local-key';
  /** 公钥文件路径 */
  publicKeyPath: string;
  /** 私钥文件路径 */
  privateKeyPath: string;
}

/**
 * 认证配置
 */
interface AuthConfigure {
  /**
   * 设备限制数量（已废弃）
   * @deprecated
   */
  device_limit?: number;
  /** 会话限制数量 */
  session_limit: number;
  /** 访问令牌过期时间(秒) */
  accessTokenTTL: number;
  /** 刷新令牌过期时间(秒) */
  refreshTokenTTL: number;
  /** API令牌过期时间(秒) */
  apiTokenTTL: number;
  /** JWT 配置，支持密钥或本地密钥文件两种模式 */
  jwt: SecretConfigure | LocalKeyConfigure;
}

export const getFeatureConfigure = () => {
  const question:QuestionCollection<FeatureConfigure> = [
    {
      type: 'confirm',
      name: 'preview',
      default: false,
      message: '是否开启预览功能 (如果开启会关闭写入和删除功能)',
    }
  ]
  return inquirer.prompt(question);
}
export const getAuthConfigure = () => {
  const question: QuestionCollection<AuthConfigure> = [
    {
      type: 'number',
      name: 'session_limit',
      default: 1,
      message: '会话限制数量',
      prefix: '*'
    },
    {
      type: 'number',
      name: 'accessTokenTTL',
      default: 300,
      message: '访问令牌过期时间(秒)',
      prefix: '*'
    },
    {
      type: 'number',
      name: 'refreshTokenTTL',
      default: 86400,
      message: '刷新令牌过期时间(秒)',
      prefix: '*'
    },
    {
      type: 'number',
      name: 'apiTokenTTL',
      default: 604800,
      message: 'API令牌过期时间(秒)',
      prefix: '*'
    },
    {
      type: 'list',
      name: 'jwt.mode',
      message: 'JWT模式',
      default: 'secret',
      choices: ['secret', 'local-key'],
      prefix: '*'
    },
    {
      type: 'input',
      name: 'jwt.secret',
      message: 'JWT密钥',
      prefix: '*',
      when(answers) {
        return answers.jwt.mode === 'secret'
      },
    },
    {
      type: 'input',
      name: 'jwt.publicKeyPath',
      message: '公钥文件路径',
      prefix: '*',
      when(answers) {
        return answers.jwt.mode === 'local-key'
      },
    },
    {
      type: 'input',
      name: 'jwt.privateKeyPath',
      message: '私钥文件路径',
      prefix: '*',
      when(answers) {
        return answers.jwt.mode === 'local-key'
      },
    },
  ]
  return inquirer.prompt(question);
}

export const createNextNestjsServer = async (answer: ProjectInfo) => {
  const { name, host, port, database, username, password, redisHost, redisPort } = answer;
  const from = utils.getTemplatePath('nest-next');
  const to = utils.getDistPath(`${name}/nest`);
  const configPath = utils.getDistPath(`${name}/nest/configs/config.json`);
  const authConfigure = {auth: await getAuthConfigure()};
  const featureConfigure = {feature: await getFeatureConfigure()};

  const config = {
    database: {
      host, port, user: username, password, dbName: database,
    },
    redis:{
      host: redisHost, port: redisPort,
      user: 'root', password: 'root', db: 0,
    },
    feature: {
      preview: featureConfigure.feature.preview
    },
    ...authConfigure
  };
  copySync(from, to, {filter: (src) =>{
    return !src.includes('node_modules')
  }});
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}
