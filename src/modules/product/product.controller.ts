import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  EntityManager,
  EntityRepository,
  QueryOrder,
  wrap,
} from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { Product } from '../../entities/Product';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: EntityRepository<Product>,
    private readonly em: EntityManager,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List up to 20 products' })
  @ApiResponse({
    status: 200,
    description: 'Found products',
    type: [ProductResponseDto],
  })
  async find() {
    const products = await this.productRepository.findAll({
      orderBy: { name: QueryOrder.ASC },
      limit: 20,
    });

    return products.map((p) => new ProductResponseDto(p));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found product',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productRepository.findOne(id);

    if (!product) {
      throw new HttpException(
        `Product with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return new ProductResponseDto(product);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateProductDto) {
    const product = this.productRepository.create(dto);
    await this.em.flush();

    return new ProductResponseDto(product);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    const product = await this.productRepository.findOne(id);

    if (!product) {
      throw new HttpException(
        `Product with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    wrap(product).assign(dto);
    await this.em.flush();

    return new ProductResponseDto(product);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an existing product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productRepository.findOne(id);

    if (!product) {
      throw new HttpException(
        `Product with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.em.removeAndFlush(product);
  }
}
