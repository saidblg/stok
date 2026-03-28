import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Ahmet Yılmaz', required: false, nullable: true })
  @IsOptional()
  @IsString({ message: 'Müşteri adı metin olmalıdır' })
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  name?: string;

  @ApiProperty({ example: '0532 123 45 67', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  phone?: string;

  @ApiProperty({ example: 'ahmet@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  email?: string;

  @ApiProperty({ example: 'İstanbul, Türkiye', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  address?: string;

  @ApiProperty({ example: 'VIP müşteri', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  notes?: string;
}
