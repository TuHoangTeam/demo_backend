import { Body, Controller, Get, Post, Put, Patch, Delete, Param, UseGuards, Req, UseInterceptors, UploadedFiles, HttpException, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql'; // Import từ Driver cụ thể
import { QueryOrder, wrap } from '@mikro-orm/core';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Entities
import { Item, ItemStatus } from '../../entities/item/Item';
import { Category } from '../../entities/item/Category';
import { User } from '../../entities/user/User';
import { Favorite } from '../../entities/item/Favorite';

// DTOs
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemQueryDto } from './dto/item-query.dto';
import { ItemResponseDto } from './dto/item-response.dto';

@ApiTags('items')
@Controller('items')
export class ItemController {
  constructor(
    @InjectRepository(Item) private readonly itemRepo: EntityRepository<Item>,
    @InjectRepository(Category) private readonly categoryRepo: EntityRepository<Category>,
    @InjectRepository(Favorite) private readonly favoriteRepo: EntityRepository<Favorite>,
    private readonly em: EntityManager,
  ) {}

  // 1. ĐĂNG BÁN MÓN ĐỒ MỚI
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5, { // Tối đa 5 ảnh
    storage: diskStorage({
      destination: './uploads/items',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  @ApiOperation({ summary: 'Create new item' })
  async create(@Req() req: any, @Body() dto: CreateItemDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    // req.user là User Entity (do JwtStrategy trả về) -> Gán trực tiếp vào owner
    const currentUser = req.user; 
    
    const category = await this.categoryRepo.findOne(dto.categoryId);
    if (!category) throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    const imageUrls = files ? files.map(f => `http://localhost:3000/uploads/items/${f.filename}`) : [];

    const item = this.itemRepo.create({
      ...dto,
      owner: currentUser, // FIX: Truyền entity User thay vì string ID để response có name/avatar
      category: category,
      images: imageUrls,
      status: ItemStatus.AVAILABLE,
      // Các trường optional như views, favorites sẽ lấy default từ Entity
    });

    await this.em.flush();
    
    return new ItemResponseDto(item);
  }

  // 2. TÌM KIẾM & LỌC MÓN ĐỒ
  @Get()
  @ApiOperation({ summary: 'Get all items with filters' })
  async findAll(@Query() query: ItemQueryDto) {
    // --- SỬA DÒNG NÀY: Dùng this.em thay vì this.itemRepo ---
    const qb = this.em.createQueryBuilder(Item, 'i');
    
    qb.select('*').leftJoinAndSelect('i.category', 'c').leftJoinAndSelect('i.owner', 'o');
    qb.where({ status: query.status || ItemStatus.AVAILABLE });

    if (query.category) qb.andWhere({ category: query.category });
    if (query.type) qb.andWhere({ type: query.type });
    if (query.search) {
      qb.andWhere({ 
        $or: [
          { title: { $ilike: `%${query.search}%` } },
          { description: { $ilike: `%${query.search}%` } }
        ]
      });
    }

    const items = await qb.getResult();
    let result = items;

    // Filter theo bán kính
    if (query.lat && query.lng) {
      result = items.filter(item => {
        const dist = this.calculateDistance(query.lat!, query.lng!, item.latitude, item.longitude);
        (item as any).distance = Math.round(dist);
        return query.radius ? dist <= query.radius : true;
      });
      result.sort((a, b) => ((a as any).distance || 0) - ((b as any).distance || 0));
    } else {
      result.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginatedItems = result.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems.map(i => new ItemResponseDto(i, (i as any).distance)),
      total: result.length,
      page,
      limit
    };
  }

  // 3. XEM CHI TIẾT
  @Get(':id')
  @ApiOperation({ summary: 'Get item detail' })
  async findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Query('lat') lat?: number, @Query('lng') lng?: number) {
    const item = await this.itemRepo.findOne(id, { populate: ['owner', 'category'] });
    if (!item) throw new HttpException('Item not found', HttpStatus.NOT_FOUND);

    // Dùng toán tử ?? để cộng dồn an toàn
    item.views = (item.views ?? 0) + 1;
    await this.em.flush();

    // --- SỬA DÒNG NÀY: Khai báo kiểu rõ ràng ---
    let distance: number | undefined = undefined; 

    if (lat && lng) {
      distance = Math.round(this.calculateDistance(lat, lng, item.latitude, item.longitude));
    }

    return new ItemResponseDto(item, distance); // isFavorited đang tạm bỏ qua
  }

  // 4. QUẢN LÝ ĐỒ CỦA TÔI
  @Get('my/all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my items' })
  async getMyItems(@Req() req: any, @Query('status') status?: ItemStatus) {
    const userId = req.user.id;
    const filters: any = { owner: userId };
    if (status) filters.status = status;

    const items = await this.itemRepo.find(filters, {
      populate: ['category'],
      orderBy: { createdAt: QueryOrder.DESC }
    });

    return items.map(i => new ItemResponseDto(i));
  }

  // 5. CẬP NHẬT
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update item' })
  async update(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateItemDto) {
    const userId = req.user.id;
    const item = await this.itemRepo.findOne(id, { populate: ['owner'] });

    if (!item) throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    if (item.owner.id !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    wrap(item).assign(dto);
    await this.em.flush();

    return new ItemResponseDto(item);
  }

  // 6. XÓA
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete item' })
  async remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const userId = req.user.id;
    const item = await this.itemRepo.findOne(id, { populate: ['owner'] });

    if (!item) throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    if (item.owner.id !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    item.status = ItemStatus.DELETED;
    await this.em.flush();

    return { message: 'Item deleted successfully' };
  }

  // Helper tính khoảng cách
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}