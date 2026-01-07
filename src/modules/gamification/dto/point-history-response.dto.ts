import { ApiProperty } from '@nestjs/swagger';
import { PointTransaction, PointTransactionType } from '../../../entities/commerce/PointTransaction';

export class PointHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: PointTransactionType })
  type: PointTransactionType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  balanceAfter: number;

  @ApiProperty()
  createdAt: Date;

  constructor(pt: PointTransaction) {
    this.id = pt.id;
    this.amount = pt.amount;
    this.type = pt.type;
    this.description = pt.description;
    this.balanceAfter = pt.balanceAfter;
    this.createdAt = pt.createdAt ?? new Date();
  }
}