import { ApiProperty } from '@nestjs/swagger';
import { Transaction, TransactionStatus } from '../../../entities/commerce/Transaction';

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty()
  giverConfirmed: boolean;

  @ApiProperty()
  receiverConfirmed: boolean;

  @ApiProperty({ nullable: true })
  meetingLocation?: string;

  @ApiProperty({ nullable: true })
  meetingTime?: Date;

  @ApiProperty()
  item: {
    id: string;
    title: string;
    images: string[];
  };

  @ApiProperty()
  giver: {
    id: string;
    name: string;
    avatar?: string;
  };

  @ApiProperty()
  receiver: {
    id: string;
    name: string;
    avatar?: string;
  };

  @ApiProperty()
  createdAt: Date;

  constructor(t: Transaction) {
    this.id = t.id;
    this.status = t.status;
    
    // SỬA Ở ĐÂY: Thêm ?? false để mặc định là false nếu undefined
    this.giverConfirmed = t.giverConfirmed ?? false;
    this.receiverConfirmed = t.receiverConfirmed ?? false;
    
    this.meetingLocation = t.meetingLocation;
    this.meetingTime = t.meetingTime;
    
    // SỬA Ở ĐÂY: Thêm ?? new Date() để tránh lỗi Date | undefined
    this.createdAt = t.createdAt ?? new Date();

    // Map relations
    this.item = {
      id: t.item.id,
      title: t.item.title,
      images: t.item.images || [],
    };

    this.giver = {
      id: t.giver.id,
      name: t.giver.name,
      avatar: t.giver.avatar,
    };

    this.receiver = {
      id: t.receiver.id,
      name: t.receiver.name,
      avatar: t.receiver.avatar,
    };
  }
}