import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../entities/user/User';

export class EcoImpactResponseDto {
  @ApiProperty()
  totalCO2Saved: number;

  @ApiProperty({ description: 'Ước tính rác thải giảm được (kg)' })
  trashReduced: number;

  @ApiProperty({ description: 'Tương đương số cây xanh trồng được' })
  equivalentTrees: number;

  @ApiProperty()
  rank: string;

  constructor(user: User) {
    this.totalCO2Saved = user.totalCO2Saved ?? 0;
    
    // Giả định: 1kg đồ cũ tái sử dụng = 1kg rác giảm
    this.trashReduced = (user.totalItemsGiven ?? 0) + (user.totalItemsReceived ?? 0); // Logic đơn giản hóa
    
    // Giả định: 1 cây xanh hấp thụ khoảng 20kg CO2/năm
    this.equivalentTrees = Math.floor(this.totalCO2Saved / 20);

    // Logic xếp hạng đơn giản
    if (this.totalCO2Saved > 100) this.rank = 'Eco Warrior';
    else if (this.totalCO2Saved > 50) this.rank = 'Green Saver';
    else this.rank = 'Beginner';
  }
}