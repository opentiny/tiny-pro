import { JwtService } from '@nestjs/jwt';
import { toTokenId } from './entity';
import { ConfigureService } from '@app/configure';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigureService,
  ) {}

  createApiTokenDetail(email: string, tokenName?: string) {
    const tokenId = tokenName
      ? toTokenId(tokenName)
      : `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ttl = this.configService.get('auth.apiTokenTTL');
    const payload = { email, type: 'api' };
    const token = this.jwtService.sign(payload, { expiresIn: ttl });
    return {
      token,
      tokenId,
      expiresIn: ttl,
    };
  }
}
