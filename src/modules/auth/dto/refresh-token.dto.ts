import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Token dùng để cấp phát lại Access Token' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}