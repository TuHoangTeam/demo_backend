import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql'; // Hoặc @mikro-orm/core tùy version
import { User } from '../../../entities/user/User';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly configService: ConfigService,
  ) {
    // Gọi super() trước khi làm bất cứ việc gì khác
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // SỬA LỖI Ở ĐÂY: Thêm || 'secret' để TypeScript hiểu rằng biến này không bao giờ undefined
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret_mac_dinh_tam_thoi', 
    });
    
    // Log debug sau khi super() đã chạy xong
    const secret = configService.get<string>('JWT_SECRET');
    console.log('🔑 [JwtStrategy] Secret đang dùng:', secret ? '***Đã load OK***' : '⚠️ Đang dùng fallback (Kiểm tra lại .env)');
  }

  async validate(payload: any) {
    console.log('🔍 [JwtStrategy] Payload nhận được:', payload);

    const userId = payload.sub || payload.id;

    if (!userId) {
        console.log('❌ [JwtStrategy] Lỗi: Token không có ID');
        throw new UnauthorizedException();
    }

    const user = await this.userRepo.findOne({ id: userId });
    
    if (!user) {
      console.log('❌ [JwtStrategy] Lỗi: Không tìm thấy User trong DB với ID:', userId);
      throw new UnauthorizedException('User no longer exists');
    }

    console.log('✅ [JwtStrategy] Success!');
    return user;
  }
}