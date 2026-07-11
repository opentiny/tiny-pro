import { SetMetadata } from "@nestjs/common";

export const PermissionKey = Symbol('permission.decorator');

export const Permission = (...permissions: string[]) => SetMetadata(PermissionKey, permissions);