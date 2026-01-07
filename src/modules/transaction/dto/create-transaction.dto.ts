import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 'uuid-cua-mon-do', description: 'ID của món đồ muốn xin' })
  @IsUUID()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({ example: 'Ký túc xá Khu A', required: false })
  @IsString()
  @IsOptional()
  meetingLocation?: string;

  @ApiProperty({ example: '2026-01-10T15:00:00Z', required: false })
  @IsDateString() // Kiểm tra định dạng ngày giờ ISO 8601
  @IsOptional()
  meetingTime?: Date;
}