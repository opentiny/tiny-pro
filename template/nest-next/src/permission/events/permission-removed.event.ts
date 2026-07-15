import { PermissionId } from '../permission.entry';

export class PermissionRemoved {
  constructor(public readonly id: PermissionId) {}
}
