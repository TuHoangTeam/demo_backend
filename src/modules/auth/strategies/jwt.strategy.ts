import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { User } from '../../../entities/user/User';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // LƯU Ý: Trong thực tế hãy dùng process.env.JWT_SECRET
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY_DEMO_123',
    });
  }

  async validate(payload: any) {
    // Payload là dữ liệu được giải mã từ token (chứa userId)
    const user = await this.userRepo.findOne({ id: payload.sub });
    
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    
    // Trả về user object, nó sẽ được gắn vào req.user trong các Controller
    return user;
  }
}