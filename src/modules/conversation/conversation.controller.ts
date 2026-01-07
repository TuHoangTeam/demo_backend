import { Body, Controller, Get, Post, Param, Query, UseGuards, Req, HttpException, HttpStatus, ParseUUIDPipe, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager, QueryOrder } from '@mikro-orm/core';

// Entities
import { Conversation } from '../../entities/social/Conversation';
import { Message } from '../../entities/social/Message';
import { User } from '../../entities/user/User';
import { Item } from '../../entities/item/Item';

// DTOs
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@ApiTags('conversations')
@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ConversationController {
  constructor(
    @InjectRepository(Conversation) private readonly convRepo: EntityRepository<Conversation>,
    @InjectRepository(Message) private readonly msgRepo: EntityRepository<Message>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    @InjectRepository(Item) private readonly itemRepo: EntityRepository<Item>,
    private readonly em: EntityManager,
  ) {}

  // 1. TẠO CUỘC TRÒ CHUYỆN MỚI
  @Post()
  @ApiOperation({ summary: 'Start a conversation' })
  async create(@Req() req: any, @Body() dto: CreateConversationDto) {
    const currentUserId = req.user.id;
    
    if (currentUserId === dto.otherUserId) {
      throw new HttpException('Cannot chat with yourself', HttpStatus.BAD_REQUEST);
    }

    const otherUser = await this.userRepo.findOne(dto.otherUserId);
    if (!otherUser) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Tìm xem đã tồn tại hội thoại chưa?
    // Logic: (user1=Me AND user2=Other) OR (user1=Other AND user2=Me)
    // Nếu chat theo Item thì thêm điều kiện ItemId
    let existingConv = await this.convRepo.findOne({
      $or: [
        { user1: currentUserId, user2: dto.otherUserId },
        { user1: dto.otherUserId, user2: currentUserId },
      ],
      // Nếu muốn mỗi món đồ 1 đoạn chat riêng thì uncomment dòng dưới
      // item: dto.itemId ? dto.itemId : undefined 
    }, { populate: ['user1', 'user2', 'item', 'lastMessage'] });

    if (existingConv) {
      return new ConversationResponseDto(existingConv, currentUserId);
    }

    // Nếu chưa có, tạo mới
    const newItem = dto.itemId ? await this.itemRepo.findOne(dto.itemId) : undefined;

    const conv = this.convRepo.create({
      user1: currentUserId,
      user2: dto.otherUserId,
      item: newItem,
      lastMessageAt: new Date(),
    });

    await this.em.flush();
    // Populate lại để trả về DTO đủ thông tin
    await this.convRepo.populate(conv, ['user1', 'user2', 'item']);
    
    return new ConversationResponseDto(conv, currentUserId);
  }

  // 2. LẤY DANH SÁCH HỘI THOẠI CỦA TÔI
  @Get()
  @ApiOperation({ summary: 'Get my conversations' })
  async findAll(@Req() req: any) {
    const currentUserId = req.user.id;

    const conversations = await this.convRepo.find({
      $or: [{ user1: currentUserId }, { user2: currentUserId }],
    }, {
      populate: ['user1', 'user2', 'item', 'lastMessage'],
      orderBy: { lastMessageAt: QueryOrder.DESC }, // Tin mới nhất lên đầu
    });

    return conversations.map(c => new ConversationResponseDto(c, currentUserId));
  }

  // 3. GỬI TIN NHẮN
  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Req() req: any, 
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: CreateMessageDto
  ) {
    const currentUserId = req.user.id;
    const conversation = await this.convRepo.findOne(id);

    if (!conversation) throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);

    // Validate: User phải thuộc hội thoại này
    if (conversation.user1.id !== currentUserId && conversation.user2.id !== currentUserId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    // Tạo tin nhắn
    const message = this.msgRepo.create({
      conversation: conversation,
      sender: currentUserId,
      content: dto.content,
      type: dto.type,
      isRead: false,
    });

    // Cập nhật trạng thái hội thoại
    conversation.lastMessage = message; // Update relation
    conversation.lastMessageAt = new Date();

    await this.em.flush();
    return new MessageResponseDto(message);
  }

  // 4. LẤY LỊCH SỬ TIN NHẮN
  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages in conversation' })
  @ApiQuery({ name: 'limit', required: false })
  async getMessages(
    @Req() req: any, 
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit: number = 20
  ) {
    const currentUserId = req.user.id;
    const conversation = await this.convRepo.findOne(id);
    
    if (!conversation) throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    if (conversation.user1.id !== currentUserId && conversation.user2.id !== currentUserId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const messages = await this.msgRepo.find(
      { conversation: id },
      { 
        orderBy: { createdAt: QueryOrder.DESC }, // Lấy mới nhất trước
        limit: limit,
        populate: ['sender']
      }
    );

    // Đảo ngược mảng để hiển thị từ cũ đến mới (nếu frontend cần)
    return messages.reverse().map(m => new MessageResponseDto(m));
  }

  // 5. ĐÁNH DẤU ĐÃ ĐỌC
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark all messages as read' })
  async markAsRead(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const currentUserId = req.user.id;
    
    // Update tất cả tin nhắn trong hội thoại này mà KHÔNG phải do mình gửi
    await this.msgRepo.nativeUpdate(
      { conversation: id, sender: { $ne: currentUserId }, isRead: false },
      { isRead: true }
    );

    return { success: true };
  }
}