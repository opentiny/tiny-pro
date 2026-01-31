// service-locator.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class LockerDiscover implements OnModuleInit {
  private static moduleRef: ModuleRef;

  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    LockerDiscover.moduleRef = this.moduleRef;
  }

  static get<T>(type: new (...args: any[]) => T): T {
    if (!LockerDiscover.moduleRef) {
      throw new Error('ServiceLocator not initialized');
    }
    return LockerDiscover.moduleRef.get(type, { strict: false });
  }
}
