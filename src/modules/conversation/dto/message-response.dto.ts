import { ApiProperty } from '@nestjs/swagger';
import { Message, MessageType } from '../../../entities/social/Message';

export class MessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: MessageType })
  type: MessageType;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;

  constructor(msg: Message) {
    this.id = msg.id;
    this.senderId = msg.sender.id;
    this.content = msg.content;
    this.type = msg.type;
    this.isRead = msg.isRead;
    this.createdAt = msg.createdAt ?? new Date();
  }
}