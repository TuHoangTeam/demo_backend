import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn B', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Tôi yêu môi trường...', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ example: 'TP. Hồ Chí Minh', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 10.762622, required: false })
  @IsNumber()
  @Type(() => Number) // Ép kiểu nếu gửi form-data
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 106.660172, required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  longitude?: number;
}