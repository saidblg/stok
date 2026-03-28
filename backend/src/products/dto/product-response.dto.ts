import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductResponseDto {
  @ApiProperty({ example: 'clxxxx1234' })
  id: string;

  @ApiProperty({ example: 'Laptop' })
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  image: string | null;

  @ApiProperty({ example: 5000.00 })
  purchasePrice: number | Decimal;

  @ApiProperty({ example: 8000.00 })
  salePrice: number | Decimal;

  @ApiProperty({ example: 50 })
  stock: number;

  @ApiProperty({ example: 10 })
  lowStockThreshold: number;

  @ApiProperty({ example: false })
  isLowStock: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  constructor(product: any) {
    this.id = product.id;
    this.name = product.name;
    this.image = product.image;
    this.purchasePrice = product.purchasePrice;
    this.salePrice = product.salePrice;
    this.stock = product.stock;
    this.lowStockThreshold = product.lowStockThreshold;
    this.isLowStock = product.stock <= product.lowStockThreshold;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}
