import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Review } from '../../entities/Review'; 
import { CreateReviewDto } from './dto/create-review.dto';
import { EntityManager } from '@mikro-orm/knex'; 

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: EntityRepository<Review>,
    private readonly em: EntityManager, 
  ) {}

  
  async findAll(productId?: number): Promise<Review[]> {
    if (typeof productId === 'number') {
      
      
      return this.reviewRepo.find({ productId: productId });
    }
    
    return this.reviewRepo.findAll();
  }

  
  async create(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<Review> {
    
    const review = this.reviewRepo.create({
      ...createReviewDto, 
      userId: userId,
      createdAt: new Date(), 
      updatedAt: new Date(), 
    });

    
    await this.em.persistAndFlush(review);
    
    
    return review;
  }
}