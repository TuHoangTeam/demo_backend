import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../../../entities/item/Category';

export class CategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;

  @ApiProperty({ nullable: true })
  icon?: string;

  constructor(c: Category) {
    this.id = c.id;
    this.name = c.name;
    this.color = c.color;
    this.icon = c.icon;
  }
}