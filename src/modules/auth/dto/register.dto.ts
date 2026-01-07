import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '0909123456', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  // --- Location Info (Optional lúc đăng ký) ---
  @ApiProperty({ example: 'TP. Hồ Chí Minh', required: false })
  @IsString()
  @IsOptional()
  location?: string;
}