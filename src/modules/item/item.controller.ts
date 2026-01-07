import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { EntityRepository, EntityManager, FilterQuery } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Item, ItemStatus, ItemType } from '../../entities/item/Item';
import { User } from '../../entities/user/User';
import { Category } from '../../entities/item/Category';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';

@ApiTags('items')
@Controller('items')
export class ItemController {
  constructor(
    @InjectRepository(Item) private readonly itemRepo: EntityRepository<Item>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    @InjectRepository(Category) private readonly categoryRepo: EntityRepository<Category>,
    private readonly em: EntityManager,
  ) { }

  // 1. Get All Items (Có bộ lọc)
  @Get()
  @ApiOperation({ summary: 'Get all items with filters' })
  @ApiResponse({ status: 200, type: [ItemResponseDto] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'type', enum: ItemType, required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('type') type?: ItemType,
  ) {
    const filters: FilterQuery<Item> = { status: ItemStatus.AVAILABLE }; // Chỉ lấy đồ còn sẵn

    if (search) {
      filters.title = { $ilike: `%${search}%` }; // Tìm kiếm gần đúng không phân biệt hoa thường
    }
    if (categoryId) {
      filters.category = categoryId;
    }
    if (type) {
      filters.type = type;
    }

    // Logic lọc theo bán kính (radius) sẽ phức tạp hơn, tạm thời làm filters cơ bản trước.
    
    const items = await this.itemRepo.find(
      filters, 
      { 
        populate: ['category', 'owner'], 
        orderBy: { createdAt: 'DESC' } 
      }
    );

    return items.map(item => new ItemResponseDto(item));
  }

  // 2. Get Item Detail
  @Get(':id')
  @ApiOperation({ summary: 'Get item detail' })
  @ApiResponse({ status: 200, type: ItemResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const item = await this.itemRepo.findOne(id, { populate: ['category', 'owner'] });
    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }
    
    // Tăng lượt xem (Optional logic)
    item.views = (item.views ?? 0) + 1;
    await this.em.flush();

    return new ItemResponseDto(item);
  }

  // 3. Create Item
  @Post()
  @ApiOperation({ summary: 'Create new item' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @Body() dto: CreateItemDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // FIX CỨNG user ID để test (Sau này thay bằng req.user.id từ JWT)
    // Lưu ý: Đảm bảo DB đã có ít nhất 1 user
    const owner = await this.userRepo.findOne({}); 
    if (!owner) throw new HttpException('No users found in DB to assign owner', HttpStatus.NOT_FOUND);

    const category = await this.categoryRepo.findOne(dto.categoryId);
    if (!category) throw new HttpException('Category not found', HttpStatus.BAD_REQUEST);

    const imageUrls = files ? files.map(file => {
      // Trong thực tế nên dùng biến môi trường: process.env.BASE_URL
      return `http://localhost:3000/uploads/items/${file.filename}`;
    }) : [];

    const item = this.itemRepo.create({
      ...dto,
      owner: owner,
      category: category,
      images: imageUrls,
      estimatedCO2: dto.estimatedCO2 || (category.avgCO2PerKg * 1), // Tạm tính = 1kg * avg
      status: ItemStatus.AVAILABLE,
    });

    await this.em.flush();
    return new ItemResponseDto(item);
  }

  // 4. Update Item
  @Put(':id')
  @ApiOperation({ summary: 'Update item' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateItemDto) {
    const item = await this.itemRepo.findOne(id);
    if (!item) throw new HttpException('Item not found', HttpStatus.NOT_FOUND);

    // TODO: Kiểm tra quyền sở hữu (chỉ owner mới được sửa)

    this.itemRepo.assign(item, dto);
    await this.em.flush();
    
    return new ItemResponseDto(item);
  }

  // 5. Delete Item
  @Delete(':id')
  @ApiOperation({ summary: 'Delete item' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const item = await this.itemRepo.findOne(id);
    if (!item) throw new HttpException('Item not found', HttpStatus.NOT_FOUND);

    // Thay vì xóa vĩnh viễn, ta đổi status thành DELETED (Soft Delete)
    item.status = ItemStatus.DELETED;
    await this.em.flush();
    
    return { message: 'Item deleted successfully' };
  }
}