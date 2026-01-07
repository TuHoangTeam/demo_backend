import { ApiProperty } from '@nestjs/swagger';
import { Conversation } from '../../../entities/social/Conversation';
import { Message } from '../../../entities/social/Message';

export class ConversationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  lastMessage?: string; // Nội dung tin cuối

  @ApiProperty({ nullable: true })
  lastMessageAt?: Date;

  @ApiProperty({ nullable: true })
  unreadCount: number;

  @ApiProperty()
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };

  @ApiProperty({ nullable: true })
  item?: {
    id: string;
    title: string;
    image?: string;
  };

  constructor(conv: Conversation, currentUserId: string) {
    this.id = conv.id;
    this.lastMessageAt = conv.lastMessageAt;
    this.unreadCount = 0; // TODO: Cần logic đếm tin chưa đọc thực tế

    // Map Last Message Content
    if (conv.lastMessage) {
      // Vì lastMessage là relation Lazy, ta ép kiểu hoặc check data
      const msg = conv.lastMessage as unknown as Message;
      this.lastMessage = msg.content;
    }

    // Xác định ai là người đối diện
    const isUser1 = conv.user1.id === currentUserId;
    const partner = isUser1 ? conv.user2 : conv.user1;

    this.otherUser = {
      id: partner.id,
      name: partner.name,
      avatar: partner.avatar,
    };

    // Map Item (nếu có)
    if (conv.item) {
      this.item = {
        id: conv.item.id,
        title: conv.item.title,
        image: conv.item.images?.[0] || '', // Lấy ảnh đầu tiên
      };
    }
  }
}