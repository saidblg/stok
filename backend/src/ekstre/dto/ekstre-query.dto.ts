import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum EntityType {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
}

export class EkstreQueryDto {
  @ApiProperty({
    description: 'Varlık tipi (müşteri veya tedarikçi)',
    enum: EntityType,
    default: EntityType.CUSTOMER,
  })
  @IsEnum(EntityType)
  @IsOptional()
  entityType?: EntityType = EntityType.CUSTOMER;

  @ApiProperty({ description: 'Müşteri veya Tedarikçi ID', example: 'clxxxx1234' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'Başlangıç tarihi (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Bitiş tarihi (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsDateString()
  endDate: string;
}
