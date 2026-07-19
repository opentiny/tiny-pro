export type AuthConfigure = {
  /**
   * @deprecated
   */
  device_limit: number;
  session_limit: number;
  accessTokenTTL: number;
  refreshTokenTTL: number;
  apiTokenTTL: number;
  jwt: JwtConfigure;
};

export type JwtConfigure = SecretConfigure | LocalKeyConfigure;
export type SecretConfigure = {
  mode: 'secret';
  secret: string;
};
export type LocalKeyConfigure = {
  mode: 'local-key';
  publicKeyPath: string;
  privateKeyPath: string;
};
