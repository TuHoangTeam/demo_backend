import { ApiProperty } from '@nestjs/swagger';
import { Item, ItemCondition, ItemType, ItemStatus } from '../../../entities/item/Item';

export class ItemResponseDto {
  @ApiProperty()
  id: string; 

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ItemCondition })
  condition: ItemCondition;

  @ApiProperty({ enum: ItemType })
  type: ItemType;

  @ApiProperty({ enum: ItemStatus })
  status: ItemStatus;

  @ApiProperty()
  location: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  estimatedCO2: number;

  @ApiProperty()
  views: number;

  @ApiProperty()
  favorites: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // SỬA 1: Thêm dấu ? và nullable: true vì có thể Item chưa populate Category
  @ApiProperty({ nullable: true })
  category?: { id: string; name: string };

  // SỬA 2: Thêm dấu ? và nullable: true vì có thể Item chưa populate Owner
  @ApiProperty({ nullable: true })
  owner?: { id: string; name: string; avatar?: string; rating: number };

  constructor(item: Item) {
    this.id = item.id;
    this.title = item.title;
    this.description = item.description;
    this.condition = item.condition;
    this.type = item.type;
    this.status = item.status;
    this.location = item.location;
    this.latitude = item.latitude;
    this.longitude = item.longitude;
    this.images = item.images || [];
    
    // Các trường số/ngày tháng cần fallback ?? để tránh undefined
    this.estimatedCO2 = item.estimatedCO2 ?? 0;
    this.views = item.views ?? 0;
    this.favorites = item.favorites ?? 0;
    this.createdAt = item.createdAt ?? new Date();
    this.updatedAt = item.updatedAt ?? new Date();

    // Map Category (chỉ map nếu biến item.category có dữ liệu)
    // Lưu ý: item.category có thể là Reference wrapper, cần check .id hoặc object
    if (item.category) {
      this.category = {
        id: item.category.id,
        name: item.category.name,
      };
    }

    // Map Owner
    if (item.owner) {
      this.owner = {
        id: item.owner.id,
        name: item.owner.name,
        avatar: item.owner.avatar,
        // SỬA 3: item.owner.rating có thể undefined trong Entity User, cần ?? 0
        rating: item.owner.rating ?? 0, 
      };
    }
  }
}