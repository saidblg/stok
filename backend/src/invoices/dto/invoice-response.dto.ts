import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { InvoiceType, VatRate } from '@prisma/client';

export class InvoiceResponseDto {
  @ApiProperty({ example: 'clxxxxx' })
  id: string;

  @ApiProperty({ enum: InvoiceType, example: 'INCOMING' })
  type: InvoiceType;

  @ApiProperty({ example: 12500.5 })
  amount: number | Decimal;

  @ApiProperty({ enum: VatRate, example: 'VAT_10' })
  vatRate: VatRate;

  @ApiProperty({ required: false, nullable: true, example: 'Mart ayı elektrik faturası' })
  note: string | null;

  @ApiProperty({ example: '2026-03-28T00:00:00.000Z' })
  date: Date;

  @ApiProperty({ example: '2026-03-28T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-28T00:00:00.000Z' })
  updatedAt: Date;

  constructor(invoice: any) {
    this.id = invoice.id;
    this.type = invoice.type;
    this.amount = invoice.amount;
    this.vatRate = invoice.vatRate;
    this.note = invoice.note;
    this.date = invoice.date;
    this.createdAt = invoice.createdAt;
    this.updatedAt = invoice.updatedAt;
  }
}
