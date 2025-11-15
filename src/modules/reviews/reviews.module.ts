import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReviewsService } from './reviews.service';
import { Review } from '../../entities/Review';
import { Product } from '../../entities/Product'; // Import Product
import { ReviewsController } from './reviews.controller';

@Module({
  imports: [
    // Đăng ký các repository cho service
    MikroOrmModule.forFeature([Review, Product]),
  ],
  providers: [ReviewsService],
  exports: [ReviewsService],
  controllers: [ReviewsController], // Export service để module khác dùng
})
export class ReviewsModule {}