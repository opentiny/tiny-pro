import { Inject, Injectable } from '@nestjs/common';
import { JwtOptions, MODULE_OPTIONS_TOKEN } from './jwt.configure';
import { decodeJwt, JWTPayload, jwtVerify, JWTVerifyResult, SignJWT } from '@gaonengwww/jose';

@Injectable()
export class JwtService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private cfg: JwtOptions
  ){}

  decode<T={}>(token: string): T & JWTPayload{
    return decodeJwt<T>(token)
  }

  async verify<T>(token: string): Promise<JWTVerifyResult<T>>{
    const secrect = new TextEncoder().encode(this.cfg.secrect);
    const ret = await jwtVerify<T>(token,secrect);
    return ret
  }

  async sign<T extends {}>(
    payload:T,
    expire: number
  ){
    const secrect = new TextEncoder().encode(this.cfg.secrect);
    return new SignJWT(payload)
    .setExpirationTime(
      new Date(Date.now() + expire)
    )
    .setProtectedHeader({
      alg: 'HS256'
    })
    .sign(secrect)
  }
}
