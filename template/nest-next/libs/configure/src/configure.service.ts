import { ConfigService, Path, PathValue } from '@nestjs/config';
import { Configure } from './configure/configure';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigureService {
  constructor(private readonly configService: ConfigService<Configure, true>) {}
  get<P extends Path<Configure>>(path: P): PathValue<Configure, P> {
    return this.configService.get(path, { infer: true });
  }
}
