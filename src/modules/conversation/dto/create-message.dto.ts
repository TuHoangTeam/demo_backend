import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '../../../entities/social/Message';

export class CreateMessageDto {
  @ApiProperty({ example: 'Sản phẩm này còn không bạn?' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ enum: MessageType, default: MessageType.TEXT })
  @IsEnum(MessageType)
  @IsOptional()
  type: MessageType = MessageType.TEXT;
}