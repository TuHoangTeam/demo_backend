import { BadRequestException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import * as bcrypt from 'bcrypt';

import { User, UserStatus } from '../../entities/user/User';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 1. ĐĂNG KÝ
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const exists = await this.userRepo.count({ email: dto.email });
    if (exists > 0) {
      throw new BadRequestException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      gPoints: 15,
    });

    await this.userRepo.getEntityManager().persistAndFlush(user);
    return this.generateAuthResponse(user);
  }

  // 2. ĐĂNG NHẬP
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOne({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateAuthResponse(user);
  }

  // 3. REFRESH TOKEN
  async refreshToken(dto: RefreshTokenDto): Promise<{ token: string }> {
    try {
      // Verify token cũ
      const payload = this.jwtService.verify(dto.refreshToken);
      
      // Kiểm tra user còn tồn tại không
      const user = await this.userRepo.findOne({ id: payload.sub });
      if (!user) throw new UnauthorizedException('User not found');

      // Cấp token mới
      const newToken = this.jwtService.sign({ sub: user.id, email: user.email });
      return { token: newToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // 4. FORGOT PASSWORD (Gửi email)
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ email: dto.email });
    if (!user) {
      // Vì lý do bảo mật, không báo lỗi nếu email không tồn tại, chỉ giả vờ thành công
      return { message: 'If email exists, a reset link has been sent' };
    }

    // Tạo token reset sống 15 phút
    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'reset_password' },
      { expiresIn: '15m' }
    );

    // MOCK SEND EMAIL: Trong thực tế bạn sẽ gọi EmailService ở đây
    console.log(`[MOCK EMAIL] Reset Link for ${user.email}: http://localhost:3000/reset-password?token=${resetToken}`);

    return { message: 'Reset link sent to email' };
  }

  // 5. RESET PASSWORD
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(dto.token);
      if (payload.purpose !== 'reset_password') throw new Error();

      const user = await this.userRepo.findOne({ id: payload.sub });
      if (!user) throw new NotFoundException('User not found');

      // Hash mật khẩu mới
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(dto.newPassword, salt);

      await this.userRepo.getEntityManager().flush();
      return { message: 'Password reset successfully' };
    } catch (e) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  // 6. LOGOUT
  async logout(): Promise<{ message: string }> {
    // JWT là stateless, logout chủ yếu xử lý ở Client (xóa token).
    // Nếu muốn chặt chẽ, cần lưu token vào Blacklist trong Redis.
    return { message: 'Logged out successfully' };
  }

  // --- Helper ---
  private generateAuthResponse(user: User): AuthResponseDto {
    const payload = { sub: user.id, email: user.email };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }
}