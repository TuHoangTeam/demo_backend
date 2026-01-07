import { Body, Controller, Get, Post, Patch, Param, HttpException, HttpStatus, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';

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
  @ApiOperation({ summary: 'Request an item (Create Transaction)' })
  async create(@Body() dto: CreateTransactionDto) {
    // A. Giả lập lấy User đang đăng nhập (SAU NÀY LẤY TỪ JWT)
    // Tạm thời lấy user khác owner của item
    const item = await this.itemRepo.findOne(dto.itemId, { populate: ['owner'] });
    if (!item) throw new HttpException('Item not found', HttpStatus.NOT_FOUND);

    // Không được xin đồ của chính mình
    // const currentUserId = req.user.id; // TODO: Real logic
    // if (item.owner.id === currentUserId) ...

    // Fake user nhận (người dùng thứ 2 trong DB chẳng hạn)
    const receiver = await this.userRepo.findOne({ email: { $ne: item.owner.email } }); 
    if (!receiver) throw new HttpException('Receiver not found for testing', HttpStatus.BAD_REQUEST);

    // B. Validate Logic
    if (item.status !== ItemStatus.AVAILABLE) {
      throw new HttpException('Item is not available', HttpStatus.BAD_REQUEST);
    }
    // Kiểm tra điểm (nếu cần): if (receiver.gPoints < 5) throw ...

    // C. Tạo Transaction
    const transaction = this.transactionRepo.create({
      item: item,
      giver: item.owner,
      receiver: receiver,
      status: TransactionStatus.PENDING,
      meetingLocation: dto.meetingLocation,
      meetingTime: dto.meetingTime,
    });

    // D. Cập nhật trạng thái Item để không ai xin được nữa
    item.status = ItemStatus.PENDING;

    await this.em.flush();
    return new TransactionResponseDto(transaction);
  }

  // 2. NGƯỜI CHO XÁC NHẬN (CONFIRM GIVER)
  @Patch(':id/confirm-giver')
  @ApiOperation({ summary: 'Giver confirms the request' })
  async confirmGiver(@Param('id', ParseUUIDPipe) id: string) {
    const transaction = await this.transactionRepo.findOne(id, { populate: ['item', 'giver', 'receiver'] });
    if (!transaction) throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);

    // TODO: Check if current user is Giver

    transaction.giverConfirmed = true;
    transaction.status = TransactionStatus.CONFIRMED; // Chuyển sang trạng thái chờ gặp
    
    // TODO: Gửi thông báo cho Receiver: "Người cho đã đồng ý!"

    await this.em.flush();
    return new TransactionResponseDto(transaction);
  }

  // 3. NGƯỜI NHẬN XÁC NHẬN ĐÃ LẤY (CONFIRM RECEIVER)
  @Patch(':id/confirm-receiver')
  @ApiOperation({ summary: 'Receiver confirms receipt' })
  async confirmReceiver(@Param('id', ParseUUIDPipe) id: string) {
    const transaction = await this.transactionRepo.findOne(id, { populate: ['item', 'giver', 'receiver'] });
    if (!transaction) throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);

    transaction.receiverConfirmed = true;
    
    // Nếu cả 2 đều đã confirm -> Tự động hoàn tất (Complete)
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

  // LOGIC XỬ LÝ ĐIỂM VÀ CO2
  private async completeTransaction(transaction: Transaction) {
    if (transaction.status === TransactionStatus.COMPLETED) return new TransactionResponseDto(transaction);

    // 1. Cập nhật trạng thái Transaction
    transaction.status = TransactionStatus.COMPLETED;
    transaction.completedAt = new Date();

    // 2. Tính toán điểm & CO2
    const POINTS_REWARD = 10;
    const POINTS_COST = 5;
    const co2Saved = transaction.item.estimatedCO2 || 0;

    transaction.giverPointsEarned = POINTS_REWARD;
    transaction.receiverPointsPaid = POINTS_COST;
    transaction.co2Saved = co2Saved;

    // 3. Cập nhật Người Cho (Giver)
    const giver = transaction.giver;
    giver.gPoints = (giver.gPoints ?? 0) + POINTS_REWARD;
    giver.totalCO2Saved = (giver.totalCO2Saved ?? 0) + co2Saved;
    giver.totalItemsGiven = (giver.totalItemsGiven ?? 0) + 1;

    // 4. Cập nhật Người Nhận (Receiver)
    const receiver = transaction.receiver;
    receiver.gPoints = (receiver.gPoints ?? 0) - POINTS_COST;
    receiver.totalItemsReceived = (receiver.totalItemsReceived ?? 0) + 1;

    // 5. Cập nhật Item
    transaction.item.status = ItemStatus.COMPLETED;

    // 6. Ghi lịch sử điểm (Audit Log)
    const logGiver = this.pointRepo.create({
      user: giver,
      amount: POINTS_REWARD,
      type: PointTransactionType.ITEM_GIVEN,
      description: `Tặng món đồ: ${transaction.item.title}`,
      relatedTransaction: transaction,
      balanceBefore: (giver.gPoints ?? 0) - POINTS_REWARD, 
      balanceAfter: giver.gPoints ?? 0,
    });

    const logReceiver = this.pointRepo.create({
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
  @ApiOperation({ summary: 'Get my transactions' })
  async getMyTransactions(
    @Query('status') status?: TransactionStatus
  ) {
    // Fake user ID
    const userId = (await this.userRepo.findOne({}))?.id; 

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