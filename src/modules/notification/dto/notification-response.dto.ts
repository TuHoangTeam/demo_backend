import { ApiProperty } from '@nestjs/swagger';
import { Notification, NotificationType } from '../../../entities/system/Notification';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ required: false })
  data?: object;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;

  constructor(n: Notification) {
    this.id = n.id;
    this.type = n.type;
    this.title = n.title;
    this.body = n.body;
    this.data = n.data;
    this.isRead = n.isRead ?? false;
    this.createdAt = n.createdAt ?? new Date();
  }
}