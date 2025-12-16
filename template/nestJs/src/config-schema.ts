import * as Joi from "joi";

export type Configure = {
  /**
   * 数据库IP
   */
  DATABASE_HOST:string;
  /**
   * 数据库端口
   */
  DATABASE_PORT:string;
  /**
   * 数据库用户名
   */
  DATABASE_USERNAME:string;
  /**
   * 数据库密码
   */
  DATABASE_PASSWORD:string;
  /**
   * 数据库名
   */
  DATABASE_NAME:string;
  /**
   * 是否自动同步
   * 这很危险, 如果设置为true, 请确保你的DATABASE_HOST是本地环境！
   */
  DATABASE_SYNCHRONIZE:boolean;
  // 是否自动加载Entry (建议设置为true)
  DATABASE_AUTOLOADENTITIES:boolean;
  /**
   * JWT secrect
   */
  AUTH_SECRET:string;
  /**
   * AccessToken过期时间
   */
  REDIS_SECONDS:number;
  /**
   * Redis IP
   */
  REDIS_HOST:string;
  /**
   * 数据库 端口
   */
  REDIS_PORT:string;
  // JwT过期时间 (已废弃)
  EXPIRES_IN:string;
  /**
   * 默认页码
   */
  PAGINATION_PAGE:number;
  /**
   * 默认页大小
   */
  PAGINATION_LIMIT:number;
  /**
   * api全局前缀
   */
  GLOBAL_PREFIX:string;
  // mock接口glob表达式
  MOCK_REGEX:string;
  /**
   * 刷新令牌过期时间
   */
  REFRESH_TOKEN_TTL:number;
  /**
   * 设备数量限制, -1表示无限制
   */
  DEVICE_LIMIT:number;
  // 是否启用演示模式, 如果设置为true, 则会拒绝所有的增加、修改、删除操作
  PREVIEW_MODE: boolean;
  /**
   * 是否启用SWAGGER
   */
  ENABLE_SWAGGER:boolean;
  /**
   * Swagger文档标题
   */
  SWAGGER_TITLE: string;
  /**
   * Swagger文档简介
   */
  SWAGGER_DESC: string;
  /**
   * Swagger文档版本
   */
  SWAGGER_VERSION: string;
}

export const CONFIG_SCHEMA = Joi.object<Configure>({
  DATABASE_HOST: Joi.string(),
  DATABASE_PORT: Joi.string(),
  DATABASE_USERNAME: Joi.string(),
  DATABASE_PASSWORD: Joi.string(),
  DATABASE_NAME: Joi.string(),
  DATABASE_SYNCHRONIZE: Joi.bool(),
  DATABASE_AUTOLOADENTITIES: Joi.bool(),
  AUTH_SECRET: Joi.string(),
  REDIS_SECONDS: Joi.number(),
  REDIS_HOST: Joi.string(),
  REDIS_PORT: Joi.string(),
  EXPIRES_IN: Joi.string(),
  PAGINATION_PAGE: Joi.number(),
  PAGINATION_LIMIT: Joi.number(),
  GLOBAL_PREFIX: Joi.string(),
  MOCK_REGEX: Joi.string(),
  REFRESH_TOKEN_TTL: Joi.number(),
  DEVICE_LIMIT: Joi.number(),
  PREVIEW_MODE: Joi.bool().default(true),
  ENABLE_SWAGGER: Joi.bool().default(false),
  SWAGGER_TITLE: Joi.string().default('Tiny Pro'),
  SWAGGER_DESC: Joi.string().default('开箱即用的中后台模板'),
  SWAGGER_VERSION: Joi.string().default('1.0.0'),
})
