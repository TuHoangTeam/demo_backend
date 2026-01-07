import { Body, Controller, Get, Post, Delete, Param, UseGuards, Req, HttpException, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager, QueryOrder } from '@mikro-orm/core';

import { Favorite } from '../../entities/item/Favorite';
import { Item } from '../../entities/item/Item';
import { ItemResponseDto } from '../item/dto/item-response.dto'; // Dùng lại DTO Item
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class FavoriteController {
  constructor(
    @InjectRepository(Favorite) private readonly favRepo: EntityRepository<Favorite>,
    @InjectRepository(Item) private readonly itemRepo: EntityRepository<Item>,
    private readonly em: EntityManager,
  ) {}

  // 1. THÊM VÀO YÊU THÍCH
  @Post()
  @ApiOperation({ summary: 'Add item to favorites' })
  async create(@Req() req: any, @Body() dto: CreateFavoriteDto) {
    const userId = req.user.id;

    // Check item tồn tại
    const item = await this.itemRepo.findOne(dto.itemId);
    if (!item) throw new HttpException('Item not found', HttpStatus.NOT_FOUND);

    // Check đã favorite chưa
    const existing = await this.favRepo.findOne({ user: userId, item: dto.itemId });
    if (existing) {
      throw new HttpException('Item already in favorites', HttpStatus.CONFLICT);
    }

    const favorite = this.favRepo.create({
      user: userId,
      item: item,
    });

    // Logic phụ: Tăng số lượng favorites trong Item (nếu muốn hiển thị số like)
    item.favorites = (item.favorites ?? 0) + 1;

    await this.em.flush();
    return { success: true, id: favorite.id };
  }

  // 2. XÓA KHỎI YÊU THÍCH
  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from favorites' })
  async remove(@Req() req: any, @Param('itemId', ParseUUIDPipe) itemId: string) {
    const userId = req.user.id;

    const favorite = await this.favRepo.findOne({ user: userId, item: itemId });
    if (!favorite) throw new HttpException('Favorite not found', HttpStatus.NOT_FOUND);

    // Giảm số like của Item
    const item = await this.itemRepo.findOne(itemId);
    if (item && (item.favorites ?? 0) > 0) {
      item.favorites = (item.favorites ?? 0) - 1;
    }

    this.em.remove(favorite);
    await this.em.flush();

    return { success: true, message: 'Removed from favorites' };
  }

  // 3. LẤY DANH SÁCH YÊU THÍCH
  @Get()
  @ApiOperation({ summary: 'Get my favorite items' })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Req() req: any, @Query('limit') limit: number = 20) {
    const userId = req.user.id;

    const favorites = await this.favRepo.find(
      { user: userId },
      {
        populate: ['item', 'item.category', 'item.owner'], // Populate để lấy thông tin món đồ
        orderBy: { createdAt: QueryOrder.DESC },
        limit: Number(limit),
      }
    );

    // Trả về danh sách Item thay vì danh sách Favorite object
    return favorites.map(fav => new ItemResponseDto(fav.item));
  }
}