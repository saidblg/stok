import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiProperty({ required: false, example: 'Laptop' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 'name', enum: ['name', 'stock', 'salePrice', 'createdAt'] })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'stock', 'salePrice', 'createdAt'])
  sortBy?: string;

  @ApiProperty({ required: false, example: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

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
