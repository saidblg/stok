import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateTransactionItemDto {
  @ApiProperty({ example: 'clxxxx5678', description: 'Ürün ID' })
  @IsString({ message: 'Ürün ID zorunludur' })
  productId: string;

  @ApiProperty({ example: 5, description: 'Ürün miktarı' })
  @IsInt({ message: 'Miktar tam sayı olmalıdır' })
  @Type(() => Number)
  @Min(1, { message: 'Miktar en az 1 olmalıdır' })
  quantity: number;
}

export class TransactionItemResponseDto {
  @ApiProperty({ example: 'clxxxx1234' })
  id: string;

  @ApiProperty({ example: 'clxxxx5678' })
  productId: string;

  @ApiProperty({ type: 'object', description: 'Ürün bilgisi' })
  product: {
    id: string;
    name: string;
    image: string | null;
  };

  @ApiProperty({ example: 5 })
  quantity: number;

  @ApiProperty({ example: 1500.0, description: 'İşlem anındaki birim fiyat (donmuş)' })
  unitPrice: number | Decimal;

  @ApiProperty({ example: 7500.0, description: 'quantity × unitPrice' })
  subtotal: number | Decimal;

  constructor(item: any) {
    this.id = item.id;
    this.productId = item.productId;
    this.product = item.product
      ? {
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
        }
      : null;
    this.quantity = item.quantity;
    this.unitPrice = item.unitPrice;
    this.subtotal = item.subtotal;
  }
}
