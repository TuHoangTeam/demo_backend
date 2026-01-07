import { Controller, Get, Param, ParseUUIDPipe, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Category, CategoryStatus } from '../../../entities/item/Category';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(
    @InjectRepository(Category) private readonly categoryRepo: EntityRepository<Category>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    const categories = await this.categoryRepo.find(
      { status: CategoryStatus.ACTIVE },
      { orderBy: { name: 'ASC' } }
    );
    return categories.map(c => new CategoryResponseDto(c));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const category = await this.categoryRepo.findOne(id);
    if (!category) throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    return new CategoryResponseDto(category);
  }
}