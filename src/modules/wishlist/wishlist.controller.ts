import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, Req, HttpException, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager, QueryOrder } from '@mikro-orm/core';

// Entities
import { Wishlist, WishlistStatus } from '../../entities/discovery/Wishlist';
import { WishlistMatch } from '../../entities/discovery/WishlistMatch';
import { Category } from '../../entities/item/Category';
import { User } from '../../entities/user/User';

// DTOs
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { WishlistMatchResponseDto } from './dto/wishlist-match-response.dto';

@ApiTags('wishlists')
@Controller('wishlists')
export class WishlistController {
  constructor(
    @InjectRepository(Wishlist) private readonly wishlistRepo: EntityRepository<Wishlist>,
    @InjectRepository(WishlistMatch) private readonly matchRepo: EntityRepository<WishlistMatch>,
    @InjectRepository(Category) private readonly categoryRepo: EntityRepository<Category>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  // 1. TẠO YÊU CẦU TÌM KIẾM (Wishlist)
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a wishlist' })
  async create(@Req() req: any, @Body() dto: CreateWishlistDto) {
    const userId = req.user.id;

    // Kiểm tra giới hạn (VD: mỗi user tối đa 5 wishlist active)
    const activeCount = await this.wishlistRepo.count({ user: userId, status: WishlistStatus.ACTIVE });
    if (activeCount >= 5) {
      throw new HttpException('You have reached the limit of 5 active wishlists', HttpStatus.BAD_REQUEST);
    }

    let category;
    if (dto.categoryId) {
      category = await this.categoryRepo.findOne(dto.categoryId);
      if (!category) throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    const wishlist = this.wishlistRepo.create({
      user: userId,
      keyword: dto.keyword,
      category: category,
      maxDistance: dto.maxDistance ?? 5000,
      status: WishlistStatus.ACTIVE,
    });

    await this.em.flush();
    return new WishlistResponseDto(wishlist);
  }

  // 2. LẤY DANH SÁCH WISHLIST CỦA TÔI
  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my wishlists' })
  @ApiQuery({ name: 'status', enum: WishlistStatus, required: false })
  async getMyWishlists(@Req() req: any, @Query('status') status?: WishlistStatus) {
    const userId = req.user.id;
    const filters: any = { user: userId };
    if (status) filters.status = status;

    const wishlists = await this.wishlistRepo.find(filters, {
      populate: ['category'],
      orderBy: { createdAt: QueryOrder.DESC },
    });

    return wishlists.map(w => new WishlistResponseDto(w));
  }

  // 3. LẤY KẾT QUẢ KHỚP (MATCHES) CỦA 1 WISHLIST
  @Get(':id/matches')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get matches for a wishlist' })
  async getMatches(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    const wishlist = await this.wishlistRepo.findOne(id);
    
    if (!wishlist) throw new HttpException('Wishlist not found', HttpStatus.NOT_FOUND);
    if (wishlist.user.id !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    const matches = await this.matchRepo.find(
      { wishlist: id },
      {
        populate: ['item', 'item.category', 'item.owner'], // Populate sâu để hiển thị Item đầy đủ
        orderBy: { matchScore: QueryOrder.DESC },
      }
    );

    return matches.map(m => new WishlistMatchResponseDto(m));
  }

  // 4. CẬP NHẬT WISHLIST
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a wishlist' })
  async update(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWishlistDto) {
    const userId = req.user.id;
    const wishlist = await this.wishlistRepo.findOne(id);

    if (!wishlist) throw new HttpException('Wishlist not found', HttpStatus.NOT_FOUND);
    if (wishlist.user.id !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    this.wishlistRepo.assign(wishlist, dto);
    await this.em.flush();

    return new WishlistResponseDto(wishlist);
  }

  // 5. XÓA WISHLIST
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a wishlist' })
  async delete(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    const wishlist = await this.wishlistRepo.findOne(id);

    if (!wishlist) throw new HttpException('Wishlist not found', HttpStatus.NOT_FOUND);
    if (wishlist.user.id !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    // Xóa các bản ghi Match liên quan trước
    await this.matchRepo.nativeDelete({ wishlist: id });

    // --- SỬA Ở ĐÂY ---
    // Dùng EntityManager để xóa
    this.em.remove(wishlist); 
    await this.em.flush();

    return { message: 'Wishlist deleted successfully' };
  }
  
  // 6. CỘNG ĐỒNG ĐANG TÌM GÌ (PUBLIC WISHLIST)
  @Get('public')
  @ApiOperation({ summary: 'See what others are looking for' })
  async getPublicWishlists(@Query('limit') limit: number = 10) {
    // Chỉ lấy những cái Active
    const wishlists = await this.wishlistRepo.find(
      { status: WishlistStatus.ACTIVE },
      {
        populate: ['category'],
        orderBy: { createdAt: QueryOrder.DESC },
        limit: Number(limit)
      }
    );
    
    // Ở đây ta dùng DTO trả về, FE có thể hiển thị "Ai đó đang tìm..."
    // Chú ý: DTO hiện tại chưa có thông tin User public (avatar/name người tìm), 
    // nếu cần bạn có thể bổ sung vào DTO.
    return wishlists.map(w => new WishlistResponseDto(w));
  }
}