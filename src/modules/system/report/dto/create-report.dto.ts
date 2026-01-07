import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { ReportReason } from '../../../../entities/system/Report';

export class CreateReportDto {
  @ApiProperty({ enum: ReportReason })
  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason!: ReportReason;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  reportedUserId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  reportedItemId?: string;
}