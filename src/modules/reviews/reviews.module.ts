import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ReviewsService } from './reviews.service';
import { Review } from '../../entities/Review';
import { Product } from '../../entities/Product'; // Import Product
import { User } from '../../entities/User';
import { ReviewController } from './reviews.controller';

@Module({
  imports: [
    // Đăng ký các repository cho service
    MikroOrmModule.forFeature([Review, User, Product]),
  ],
  providers: [ReviewsService],
  exports: [ReviewsService],
  controllers: [ReviewController], // Export service để module khác dùng
})
export class ReviewsModule {}