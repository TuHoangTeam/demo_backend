import { Controller, Get, Patch, Delete, Param, UseGuards, Req, Query, HttpException, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager, QueryOrder } from '@mikro-orm/core';

import { Notification } from '../../entities/system/Notification';
import { NotificationResponseDto } from './dto/notification-response.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class NotificationController {
  constructor(
    @InjectRepository(Notification) private readonly notiRepo: EntityRepository<Notification>,
    private readonly em: EntityManager,
  ) {}

  // 1. LẤY DANH SÁCH THÔNG BÁO
  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit: number = 20
  ) {
    const userId = req.user.id;
    const filters: any = { user: userId };
    
    if (unreadOnly === 'true') {
      filters.isRead = false;
    }

    const [notifications, count] = await this.notiRepo.findAndCount(filters, {
      orderBy: { createdAt: QueryOrder.DESC },
      limit: Number(limit),
    });

    // Tính toán số lượng chưa đọc thực tế
    const unreadCount = await this.notiRepo.count({ user: userId, isRead: false });

    return {
      notifications: notifications.map(n => new NotificationResponseDto(n)),
      unreadCount,
      total: count
    };
  }

  // 2. ĐÁNH DẤU ĐÃ ĐỌC (MỘT CÁI)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    const notification = await this.notiRepo.findOne({ id, user: userId });

    if (!notification) throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);

    notification.isRead = true;
    await this.em.flush();

    return { success: true };
  }

  // 3. ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user.id;
    
    // Update native query cho nhanh
    await this.notiRepo.nativeUpdate({ user: userId, isRead: false }, { isRead: true });

    return { success: true, message: 'All notifications marked as read' };
  }

  // 4. XÓA THÔNG BÁO
  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async delete(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    const notification = await this.notiRepo.findOne({ id, user: userId });

    if (!notification) throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);

    this.em.remove(notification);
    await this.em.flush();

    return { success: true };
  }
}