import { PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';

// Đổi tên class thành UpdateItemDto
export class UpdateItemDto extends PartialType(CreateItemDto) {}