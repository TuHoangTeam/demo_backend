import { Body, Controller, Get, Post, Patch, Param, HttpException, HttpStatus, Query, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { AuthGuard } from '@nestjs/passport'; // <--- Thêm cái này
import type { Request } from 'express';      // <--- Thêm cái này

// Import Entities
import { Transaction, TransactionStatus } from '../../entities/commerce/Transaction';
import { PointTransaction, PointTransactionType } from '../../entities/commerce/PointTransaction';
import { Item, ItemStatus } from '../../entities/item/Item';
import { User } from '../../entities/user/User';

// Import DTOs
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    @InjectRepository(Transaction) private readonly transactionRepo: EntityRepository<Transaction>,
    @InjectRepository(Item) private readonly itemRepo: EntityRepository<Item>,
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    @InjectRepository(PointTransaction) private readonly pointRepo: EntityRepository<PointTransaction>,
    private readonly em: EntityManager,
  ) {}

  // 1. TẠO GIAO DỊCH (XIN ĐỒ)
  @Post()
  @UseGuards(AuthGuard('jwt')) // <--- Bắt buộc đăng nhập
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request an item (Create Transaction)' })
  async create(@Req() req: any, @Body() dto: CreateTransactionDto) {
    // 1. Lấy User thật từ Token (Thay vì Fake)
    const currentUserId = req.user.id;
    const currentUser = await this.userRepo.findOne(currentUserId);
    if (!currentUser) throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);

    const item = await this.itemRepo.findOne(dto.itemId, { populate: ['owner'] });
    if (!item) throw new HttpException('Item not found', HttpStatus.NOT_FOUND);

    // 2. Validate: Không được xin đồ của chính mình
    if (item.owner.id === currentUserId) {
      throw new HttpException('Cannot request your own item', HttpStatus.BAD_REQUEST);
    }

    // 3. Validate trạng thái Item
    if (item.status !== ItemStatus.AVAILABLE) {
      throw new HttpException('Item is not available', HttpStatus.BAD_REQUEST);
    }

    // 4. Tạo Transaction
    const transaction = this.transactionRepo.create({
      item: item,
      giver: item.owner,
      receiver: currentUser, // Người nhận chính là người đang gọi API
      status: TransactionStatus.PENDING,
      meetingLocation: dto.meetingLocation,
      meetingTime: dto.meetingTime,
    });

    item.status = ItemStatus.PENDING;

    await this.em.flush();
    return new TransactionResponseDto(transaction);
  }

  // 2. NGƯỜI CHO XÁC NHẬN (CONFIRM GIVER)
  @Patch(':id/confirm-giver')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Giver confirms the request' })
  async confirmGiver(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const transaction = await this.transactionRepo.findOne(id, { populate: ['item', 'giver', 'receiver'] });
    if (!transaction) throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);

    // Validate: Chỉ người cho (Owner) mới được confirm
    if (transaction.giver.id !== req.user.id) {
      throw new HttpException('Only the giver can confirm this', HttpStatus.FORBIDDEN);
    }

    transaction.giverConfirmed = true;
    transaction.status = TransactionStatus.CONFIRMED;
    
    await this.em.flush();
    return new TransactionResponseDto(transaction);
  }

  // 3. NGƯỜI NHẬN XÁC NHẬN ĐÃ LẤY (CONFIRM RECEIVER)
  @Patch(':id/confirm-receiver')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Receiver confirms receipt' })
  async confirmReceiver(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const transaction = await this.transactionRepo.findOne(id, { populate: ['item', 'giver', 'receiver'] });
    if (!transaction) throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);

    // Validate: Chỉ người nhận mới được confirm
    if (transaction.receiver.id !== req.user.id) {
        throw new HttpException('Only the receiver can confirm this', HttpStatus.FORBIDDEN);
    }

    transaction.receiverConfirmed = true;
    
    if (transaction.giverConfirmed) {
      return this.completeTransaction(transaction);
    }

    await this.em.flush();
    return new TransactionResponseDto(transaction);
  }

  // 4. HOÀN TẤT GIAO DỊCH (HÀM NỘI BỘ HOẶC GỌI API)
  @Patch(':id/complete')
  @ApiOperation({ summary: 'Force complete transaction' })
  async complete(@Param('id', ParseUUIDPipe) id: string) {
    const transaction = await this.transactionRepo.findOne(id, { populate: ['item', 'giver', 'receiver'] });
    if (!transaction) throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
    return this.completeTransaction(transaction);
  }

  private async completeTransaction(transaction: Transaction) {
    if (transaction.status === TransactionStatus.COMPLETED) return new TransactionResponseDto(transaction);

    transaction.status = TransactionStatus.COMPLETED;
    transaction.completedAt = new Date();

    const POINTS_REWARD = 10;
    const POINTS_COST = 5;
    const co2Saved = transaction.item.estimatedCO2 || 0;

    transaction.giverPointsEarned = POINTS_REWARD;
    transaction.receiverPointsPaid = POINTS_COST;
    transaction.co2Saved = co2Saved;

    const giver = transaction.giver;
    giver.gPoints = (giver.gPoints ?? 0) + POINTS_REWARD;
    giver.totalCO2Saved = (giver.totalCO2Saved ?? 0) + co2Saved;
    giver.totalItemsGiven = (giver.totalItemsGiven ?? 0) + 1;

    const receiver = transaction.receiver;
    receiver.gPoints = (receiver.gPoints ?? 0) - POINTS_COST;
    receiver.totalItemsReceived = (receiver.totalItemsReceived ?? 0) + 1;

    transaction.item.status = ItemStatus.COMPLETED;

    this.pointRepo.create({
      user: giver,
      amount: POINTS_REWARD,
      type: PointTransactionType.ITEM_GIVEN,
      description: `Tặng món đồ: ${transaction.item.title}`,
      relatedTransaction: transaction,
      balanceBefore: (giver.gPoints ?? 0) - POINTS_REWARD, 
      balanceAfter: giver.gPoints ?? 0,
    });

    this.pointRepo.create({
      user: receiver,
      amount: -POINTS_COST,
      type: PointTransactionType.ITEM_RECEIVED,
      description: `Nhận món đồ: ${transaction.item.title}`,
      relatedTransaction: transaction,
      balanceBefore: receiver.gPoints + POINTS_COST,
      balanceAfter: receiver.gPoints,
    });

    await this.em.flush();
    return new TransactionResponseDto(transaction);
  }

  // 5. LẤY DANH SÁCH GIAO DỊCH CỦA TÔI
  @Get('my')
  @UseGuards(AuthGuard('jwt')) // <--- SỬA: Dùng Guard thật
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my transactions' })
  async getMyTransactions(
    @Req() req: any, // <--- SỬA: Inject Request
    @Query('status') status?: TransactionStatus
  ) {
    // SỬA: Lấy ID thật từ Token (Không fake query DB nữa -> Hết lỗi empty where)
    const userId = req.user.id; 

    const filters: any = {
      $or: [{ giver: userId }, { receiver: userId }]
    };
    if (status) filters.status = status;

    const transactions = await this.transactionRepo.find(filters, {
      populate: ['item', 'giver', 'receiver'],
      orderBy: { createdAt: 'DESC' }
    });

    return transactions.map(t => new TransactionResponseDto(t));
  }
}