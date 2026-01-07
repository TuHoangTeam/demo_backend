import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../../entities/user/User'; // Nhớ trỏ đúng file User
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    PassportModule,
    // Cấu hình JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_KEY_DEMO_123', // Nên để trong .env
      signOptions: { expiresIn: '7d' }, // Token sống 7 ngày
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Export để các module khác dùng nếu cần (vd: check token)
})
export class AuthModule {}