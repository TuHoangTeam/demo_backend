import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EntityRepository, wrap, EntityManager } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Product } from '../../entities/Product';
import { User } from '../../entities/User';
import { CreateProductDto } from './dto/create-product.dto';
// Giả sử bạn có file dto response tương tự UserResponseDto
import { ProductResponseDto } from './dto/product-response.dto'; 

@Controller('product')
export class ProductController {
  constructor(
    @InjectRepository(Product) private readonly productRepository: EntityRepository<Product>,
    @InjectRepository(User) private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get all available products' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  async findAll() {
    // Chỉ lấy sản phẩm còn hàng (Available = true)
    const products = await this.productRepository.find(
      { available: true }, 
      { populate: ['owner'] }
    );
    return products; // Trong thực tế nên map sang DTO
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productRepository.findOne(id, { populate: ['owner'] });
    if (!product) throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    return product;
  }

  @Post()
  @ApiOperation({ summary: 'Post a new item for exchange/sale' })
  async create(@Body() dto: CreateProductDto) {
    // Tìm người bán
    const owner = await this.userRepository.findOne(dto.ownerId);
    if (!owner) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const product = this.productRepository.create({
      ...dto,
      owner: owner,
      available: true // Luôn true khi mới tạo
    });
    
    await this.em.flush();
    return product;
  }

  @Post(':id/purchase')
  @ApiOperation({ summary: 'Mark product as sold/exchanged' })
  async purchase(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productRepository.findOne(id);
    if (!product) throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    
    if (!product.available) {
        throw new HttpException('Product already sold', HttpStatus.BAD_REQUEST);
    }

    product.available = false; // Đánh dấu đã bán
    await this.em.flush();
    
    return { message: 'Purchase successful', productId: id };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
     const product = await this.productRepository.findOne(id);
     if (!product) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
     await this.em.removeAndFlush(product);
  }
}