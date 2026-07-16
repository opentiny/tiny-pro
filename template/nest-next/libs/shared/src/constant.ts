export const roleTotal = () => `tinypro:v1:role:total`;
export const userTotal = (condition?: string) =>
  condition ? `tinypro:v1:user:total:${condition}` : `tinypro:v1:user:total`;
