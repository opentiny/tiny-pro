export type AuthConfigure = {
  /**
   * @deprecated
   */
  device_limit: number;
  session_limit: number;
  accessTokenTTL: number;
  refreshTokenTTL: number;
  apiTokenTTL: number;
};
