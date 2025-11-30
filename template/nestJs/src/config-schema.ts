import * as Joi from "joi";

export type Configure = {
  DATABASE_HOST:string;
  DATABASE_PORT:string;
  DATABASE_USERNAME:string;
  DATABASE_PASSWORD:string;
  DATABASE_NAME:string;
  DATABASE_SYNCHRONIZE:boolean;
  DATABASE_AUTOLOADENTITIES:boolean;
  AUTH_SECRET:string;
  REDIS_SECONDS:number;
  REDIS_HOST:string;
  REDIS_PORT:string;
  EXPIRES_IN:string;
  PAGINATION_PAGE:number;
  PAGINATION_LIMIT:number;
  GLOBAL_PREFIX:string;
  MOCK_REGEX:string;
  REFRESH_TOKEN_TTL:number;
  DEVICE_LIMIT:number;
  PREVIEW_MODE: boolean;
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
  PREVIEW_MODE: Joi.bool().default(true)
})
