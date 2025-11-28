import { ConfigurableModuleBuilder } from "@nestjs/common";

export interface JwtOptions {
  secrect: string;
}

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN
} = new ConfigurableModuleBuilder()
.setExtras<{ isGlobal?: boolean }>({ isGlobal: false }, (definition, extras) =>
  ({ ...definition, global: extras.isGlobal })
)
.build();
