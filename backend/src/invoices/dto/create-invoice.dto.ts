import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { InvoiceType, VatRate } from '@prisma/client';

export class CreateInvoiceDto {
  @ApiProperty({ enum: InvoiceType, example: 'INCOMING' })
  @IsEnum(InvoiceType, { message: 'Geçersiz fatura türü' })
  type: InvoiceType;

  @ApiProperty({ example: 12500.5, description: 'Fatura tutarı (KDV dahil/haric hesabı yapılmaz, olduğu gibi saklanır)' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Tutar sayı olmalıdır' })
  @Min(0.01, { message: 'Tutar 0’dan büyük olmalıdır' })
  amount: number;

  @ApiProperty({ enum: VatRate, example: 'VAT_10' })
  @IsEnum(VatRate, { message: 'Geçersiz KDV oranı' })
  vatRate: VatRate;

  @ApiProperty({ required: false, example: 'Mart ayı elektrik faturası' })
  @IsOptional()
  @IsString({ message: 'Not metin olmalıdır' })
  note?: string;

  @ApiProperty({ example: '2026-03-28T00:00:00.000Z' })
  @IsDateString({}, { message: 'Geçerli bir tarih giriniz' })
  date: string;
}
