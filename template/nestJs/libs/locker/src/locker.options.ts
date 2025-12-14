import { ConfigurableModuleBuilder } from "@nestjs/common";

export const {
  MODULE_OPTIONS_TOKEN,
  ConfigurableModuleClass
} = new ConfigurableModuleBuilder()
.setExtras({global: false}, (def, extra) => {
  return {
    ...def,
    ...extra
  }
})
.build()
