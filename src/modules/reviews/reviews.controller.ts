import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Review } from '../../entities/Review';
import { User } from '../../entities/User';
import { Product } from '../../entities/Product';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('review')
export class ReviewController {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: EntityRepository<Review>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    @InjectRepository(Product) private readonly productRepo: EntityRepository<Product>,
    private readonly em: EntityManager,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a review for a product' })
  async create(@Body() dto: CreateReviewDto) {
    const userId = await this.userRepo.findOne(dto.userId);
    const productId = await this.productRepo.findOne(dto.productId);

    if (!userId || !productId) {
        throw new HttpException('User or Product not found', HttpStatus.NOT_FOUND);
    }

    // Logic kiểm tra: Chỉ cho review nếu sản phẩm đã bán (Available = false)
    if (productId.available) {
        throw new HttpException('Cannot review an unsold product', HttpStatus.BAD_REQUEST);
    }

    const review = this.reviewRepo.create({
        rating: dto.rating,
        comment: dto.comment,
        userId: userId,
        productId: productId
    });

    await this.em.flush();
    return review;
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews by product ID' })
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    const reviews = await this.reviewRepo.find(
        { productId: productId },
        { populate: ['userId'] } // Để hiện tên người review
    );
    return reviews;
  }
}