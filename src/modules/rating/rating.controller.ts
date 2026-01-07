import { Body, Controller, Get, Post, Param, UseGuards, Req, HttpException, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';

// Entities
import { Rating } from '../../entities/social/Rating';
import { User } from '../../entities/user/User';
import { Transaction, TransactionStatus } from '../../entities/commerce/Transaction';

// DTOs
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';

@ApiTags('ratings')
@Controller('ratings')
export class RatingController {
  constructor(
    @InjectRepository(Rating) private readonly ratingRepo: EntityRepository<Rating>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    @InjectRepository(Transaction) private readonly transactionRepo: EntityRepository<Transaction>,
    private readonly em: EntityManager,
  ) {}

  // 1. TẠO ĐÁNH GIÁ MỚI
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a rating for a transaction' })
  async create(@Req() req: any, @Body() dto: CreateRatingDto) {
    const fromUserId = req.user.id;

    // A. Kiểm tra tính hợp lệ
    // 1. Không tự đánh giá mình
    if (fromUserId === dto.toUserId) {
      throw new HttpException('Cannot rate yourself', HttpStatus.BAD_REQUEST);
    }

    // 2. Tìm giao dịch
    const transaction = await this.transactionRepo.findOne(dto.transactionId, {
      populate: ['giver', 'receiver']
    });
    if (!transaction) throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);

    // 3. Giao dịch phải hoàn tất mới được đánh giá
    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new HttpException('Transaction must be COMPLETED to rate', HttpStatus.BAD_REQUEST);
    }

    // 4. Người đánh giá phải là người tham gia giao dịch (Giver hoặc Receiver)
    const isGiver = transaction.giver.id === fromUserId;
    const isReceiver = transaction.receiver.id === fromUserId;

    if (!isGiver && !isReceiver) {
      throw new HttpException('You are not involved in this transaction', HttpStatus.FORBIDDEN);
    }

    // 5. Kiểm tra xem user kia có đúng là đối tác không
    const targetUserIdInTransaction = isGiver ? transaction.receiver.id : transaction.giver.id;
    if (targetUserIdInTransaction !== dto.toUserId) {
      throw new HttpException('Invalid target user for this transaction', HttpStatus.BAD_REQUEST);
    }

    // 6. Kiểm tra xem đã đánh giá chưa (tránh spam)
    const existingRating = await this.ratingRepo.findOne({
      transaction: dto.transactionId,
      fromUser: fromUserId,
    });
    if (existingRating) {
      throw new HttpException('You have already rated this transaction', HttpStatus.CONFLICT);
    }

    // B. Tạo Rating
    const toUser = await this.userRepo.findOne(dto.toUserId);
    if (!toUser) throw new HttpException('Target user not found', HttpStatus.NOT_FOUND);

    const rating = this.ratingRepo.create({
      transaction: transaction,
      fromUser: fromUserId, // ID string tự map vào user reference
      toUser: toUser,
      rating: dto.rating,
      comment: dto.comment,
    });

    // C. Cập nhật điểm trung bình cho User (Logic toán học)
    // Công thức: NewAvg = ((OldAvg * OldCount) + NewScore) / (OldCount + 1)
    const currentCount = toUser.totalRatings ?? 0;
    const currentAvg = toUser.rating ?? 0;
    const newCount = currentCount + 1;
    const newAvg = ((currentAvg * currentCount) + dto.rating) / newCount;

    toUser.rating = parseFloat(newAvg.toFixed(2)); // Làm tròn 2 chữ số thập phân
    toUser.totalRatings = newCount;

    // Lưu tất cả vào DB
    await this.em.flush();

    return new RatingResponseDto(rating);
  }

  // 2. XEM DANH SÁCH ĐÁNH GIÁ CỦA 1 USER
  @Get('users/:userId')
  @ApiOperation({ summary: 'Get ratings of a specific user' })
  @ApiQuery({ name: 'limit', required: false })
  async getUserRatings(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit') limit: number = 10
  ) {
    const user = await this.userRepo.findOne(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const ratings = await this.ratingRepo.find(
      { toUser: userId },
      {
        populate: ['fromUser'],
        orderBy: { createdAt: 'DESC' },
        limit: Number(limit)
      }
    );

    return {
      averageRating: user.rating ?? 0,
      totalRatings: user.totalRatings ?? 0,
      ratings: ratings.map(r => new RatingResponseDto(r)),
    };
  }
}