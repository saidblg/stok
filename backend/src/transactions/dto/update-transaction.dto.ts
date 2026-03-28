import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, TransactionType } from '@prisma/client';
import { CreateTransactionItemDto } from './transaction-item.dto';

@ValidatorConstraint({ name: 'UpdateTransactionPartyConstraint', async: false })
class UpdateTransactionPartyConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: any): boolean {
    const dto = args.object as UpdateTransactionDto;
    return !(dto.customerId && dto.supplierId);
  }

  defaultMessage(): string {
    return 'Müşteri ve tedarikçi birlikte gönderilemez';
  }
}

export class UpdateTransactionDto {
  @Validate(UpdateTransactionPartyConstraint)
  private readonly partyValidation: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Müşteri ID metin olmalıdır' })
  customerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Tedarikçi ID metin olmalıdır' })
  supplierId?: string;

  @ApiProperty({ enum: TransactionType, required: false })
  @IsOptional()
  @IsEnum(TransactionType, { message: 'Geçersiz işlem tipi' })
  type?: TransactionType;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'Geçersiz ödeme yöntemi' })
  paymentMethod?: PaymentMethod;

  @ApiProperty({ type: [CreateTransactionItemDto], required: false })
  @IsOptional()
  @ValidateIf((o) => o.items !== undefined)
  @IsArray({ message: 'İşlem kalemleri dizi olmalıdır' })
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  @ArrayMinSize(1, { message: 'Kalem güncelleniyorsa en az 1 ürün gönderilmelidir' })
  items?: CreateTransactionItemDto[];

  @ApiProperty({ required: false, example: 1000 })
  @IsOptional()
  @IsNumber({}, { message: 'Tutar sayı olmalıdır' })
  @Type(() => Number)
  @Min(0, { message: 'Tutar 0 veya daha büyük olmalıdır' })
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Açıklama metin olmalıdır' })
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Geçerli bir tarih giriniz' })
  date?: string;
}
