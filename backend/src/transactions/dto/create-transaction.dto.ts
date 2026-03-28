import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateIf,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, TransactionType } from '@prisma/client';
import { CreateTransactionItemDto } from './transaction-item.dto';

@ValidatorConstraint({ name: 'TransactionPartyConstraint', async: false })
class TransactionPartyConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CreateTransactionDto;

    if (dto.customerId && dto.supplierId) {
      return false;
    }

    if (dto.type === TransactionType.PURCHASE || dto.type === TransactionType.PAYMENT) {
      return !!dto.supplierId && !dto.customerId;
    }

    return !!dto.customerId && !dto.supplierId;
  }

  defaultMessage(): string {
    return 'İşlem tipine göre yalnızca müşteri veya tedarikçi seçilmelidir';
  }
}

@ValidatorConstraint({ name: 'TransactionItemsConstraint', async: false })
class TransactionItemsConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CreateTransactionDto;

    if (dto.type === TransactionType.EXPENSE || dto.type === TransactionType.PURCHASE) {
      return Array.isArray(dto.items) && dto.items.length >= 1;
    }

    return !dto.items || dto.items.length === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as CreateTransactionDto;
    if (dto.type === TransactionType.EXPENSE || dto.type === TransactionType.PURCHASE) {
      return 'EXPENSE/PURCHASE için en az 1 ürün kalemi gereklidir';
    }
    return 'INCOME/PAYMENT işleminde ürün kalemi gönderilemez';
  }
}

@ValidatorConstraint({ name: 'TransactionPaymentMethodConstraint', async: false })
class TransactionPaymentMethodConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CreateTransactionDto;

    if (dto.type === TransactionType.PAYMENT) {
      return !!dto.paymentMethod;
    }

    return !dto.paymentMethod;
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as CreateTransactionDto;
    if (dto.type === TransactionType.PAYMENT) {
      return 'PAYMENT işleminde ödeme yöntemi zorunludur';
    }
    return 'Sadece PAYMENT işleminde ödeme yöntemi gönderilebilir';
  }
}

export class CreateTransactionDto {
  @Validate(TransactionPartyConstraint)
  private readonly partyValidation: boolean;

  @Validate(TransactionItemsConstraint)
  private readonly itemsValidation: boolean;

  @Validate(TransactionPaymentMethodConstraint)
  private readonly paymentValidation: boolean;

  @ApiProperty({ example: 'clxxxx1234', description: 'Müşteri ID (EXPENSE/INCOME için zorunlu)', required: false })
  @IsOptional()
  @IsString({ message: 'Müşteri ID metin olmalıdır' })
  customerId?: string;

  @ApiProperty({ example: 'clxxxx5678', description: 'Tedarikçi ID (PURCHASE/PAYMENT için zorunlu)', required: false })
  @IsOptional()
  @IsString({ message: 'Tedarikçi ID metin olmalıdır' })
  supplierId?: string;

  @ApiProperty({
    enum: TransactionType,
    example: 'EXPENSE',
    description: 'EXPENSE = Satış, INCOME = Tahsilat, PURCHASE = Mal Alışı, PAYMENT = Tedarikçiye Ödeme',
  })
  @IsEnum(TransactionType, { message: 'Geçersiz işlem tipi' })
  type: TransactionType;

  @ApiProperty({
    enum: PaymentMethod,
    required: false,
    description: 'PAYMENT için ödeme yöntemi (CASH/CARD)',
    example: 'CASH',
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'Geçersiz ödeme yöntemi' })
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    type: [CreateTransactionItemDto],
    description: 'EXPENSE/PURCHASE için zorunlu ürün kalemleri',
    required: false,
  })
  @ValidateIf((o) => o.items !== undefined)
  @IsArray({ message: 'İşlem kalemleri dizi olmalıdır' })
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  @ArrayMinSize(1, { message: 'En az 1 ürün seçilmelidir' })
  items?: CreateTransactionItemDto[];

  @ApiProperty({
    example: 5000.0,
    description: 'INCOME/PAYMENT için manuel tutar, diğer tiplerde sistem hesaplar',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Tutar sayı olmalıdır' })
  @Type(() => Number)
  @Min(0, { message: 'Tutar 0 veya daha büyük olmalıdır' })
  amount?: number;

  @ApiProperty({ example: 'Laptop satışı', description: 'İşlem açıklaması', required: false })
  @IsOptional()
  @IsString({ message: 'Açıklama metin olmalıdır' })
  description?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir tarih giriniz' })
  date?: string;
}
