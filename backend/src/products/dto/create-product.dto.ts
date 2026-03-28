import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop' })
  @IsString({ message: 'Ürün adı zorunludur' })
  name: string;

  @ApiProperty({ example: 5000.00, description: 'Alış fiyatı' })
  @IsNumber({}, { message: 'Alış fiyatı sayı olmalıdır' })
  @Type(() => Number)
  @Min(0, { message: 'Alış fiyatı 0 veya daha büyük olmalıdır' })
  purchasePrice: number;

  @ApiProperty({ example: 8000.00, description: 'Satış fiyatı' })
  @IsNumber({}, { message: 'Satış fiyatı sayı olmalıdır' })
  @Type(() => Number)
  @Min(0, { message: 'Satış fiyatı 0 veya daha büyük olmalıdır' })
  salePrice: number;

  @ApiProperty({ example: 50, description: 'Stok miktarı' })
  @IsInt({ message: 'Stok miktarı tam sayı olmalıdır' })
  @Type(() => Number)
  @Min(0, { message: 'Stok miktarı 0 veya daha büyük olmalıdır' })
  stock: number;

  @ApiProperty({ example: 10, description: 'Düşük stok eşik değeri', required: false })
  @IsOptional()
  @IsInt({ message: 'Düşük stok eşiği tam sayı olmalıdır' })
  @Type(() => Number)
  @Min(0, { message: 'Düşük stok eşiği 0 veya daha büyük olmalıdır' })
  lowStockThreshold?: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  image?: string;
}
