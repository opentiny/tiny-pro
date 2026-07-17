import { Command, ICommandHandler } from "@nestjs/cqrs";
import { Jti } from "../entity/token.entity";
import { UserId } from "src/user";
import { TokenData } from "../queries/get-token-data";
import { ConfigureService } from "@app/configure";
import { RedisService } from "@liaoliaots/nestjs-redis";


export class IssueToken extends Command<void>{
  constructor(
    public readonly uid: UserId,
    public readonly token: TokenData
  ){
    super();
  }
}


export class IssueTokenSerivce implements ICommandHandler<IssueToken>{
  constructor(
    private cfg: ConfigureService,
    private redisSrv: RedisService
  ){}
  execute(command: IssueToken): Promise<void> {
    const redis = this.redisSrv.getOrThrow();
    const sessionLimit = this.cfg.get('auth.session_limit') ?? this.cfg.get('auth.device_limit') ?? 1;
    redis.eval(`

`)
    throw new Error("Method not implemented.");
  }
}
