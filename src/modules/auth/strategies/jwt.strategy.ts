import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // <--- Import
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { User } from '../../../entities/user/User';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly configService: ConfigService, // <--- Inject ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Lấy secret từ .env, nếu không có thì báo lỗi hoặc fallback
      secretOrKey: configService.get<string>('JWT_SECRET') || 'FALLBACK_SECRET_NEU_QUEN_CONFIG',
    });
  }

  async validate(payload: any) {
    const user = await this.userRepo.findOne({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}