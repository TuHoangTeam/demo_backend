import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ description: 'ID của người muốn chat cùng' })
  @IsUUID()
  @IsNotEmpty()
  otherUserId!: string;

  @ApiProperty({ description: 'ID món đồ liên quan (nếu có)', required: false })
  @IsUUID()
  @IsOptional()
  itemId?: string;
}