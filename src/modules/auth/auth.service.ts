import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import * as bcrypt from 'bcrypt';

import { User, UserStatus } from '../../entities/user/User';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 1. ĐĂNG KÝ
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check email trùng
    const exists = await this.userRepo.count({ email: dto.email });
    if (exists > 0) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Tạo User mới
    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      gPoints: 15, // Tặng điểm mặc định
    });

    await this.userRepo.getEntityManager().persistAndFlush(user);

    return this.generateAuthResponse(user);
  }

  // 2. ĐĂNG NHẬP
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Tìm user (kèm password để so sánh)
    const user = await this.userRepo.findOne({ email: dto.email });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // So sánh password hash
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  // Helper: Tạo Token và Response chuẩn
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