import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '@prisma/client';

export class TransactionQueryDto {
  @ApiProperty({ required: false, example: 'clxxxx1234', description: 'Müşteri ID ile filtrele' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ required: false, enum: TransactionType, description: 'İşlem tipi ile filtrele' })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({ required: false, example: '2024-01-01T00:00:00.000Z', description: 'Başlangıç tarihi' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-12-31T23:59:59.999Z', description: 'Bitiş tarihi' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
