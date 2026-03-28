import { ApiProperty } from '@nestjs/swagger';
import { SupplierResponseDto } from './supplier-response.dto';
import { Decimal } from '@prisma/client/runtime/library';

export class SupplierBalanceDto {
  @ApiProperty({ example: 25000.00, description: 'Toplam mal alışı (PURCHASE)' })
  totalPurchases: number | Decimal;

  @ApiProperty({ example: 5000.00, description: 'Toplam ödeme (PAYMENT, net tutar)' })
  totalPayments: number | Decimal;

  @ApiProperty({ example: 20000.00, description: 'Bakiye (pozitif = tedarikçiye borcunuz var)' })
  balance: number | Decimal;
}

export class SupplierDetailDto extends SupplierResponseDto {
  @ApiProperty({ type: SupplierBalanceDto })
  balance: SupplierBalanceDto;

  @ApiProperty({ example: 8, description: 'Toplam işlem sayısı' })
  totalTransactions: number;

  constructor(supplier: any, balanceInfo: SupplierBalanceDto, totalTransactions: number) {
    super(supplier);
    this.balance = balanceInfo;
    this.totalTransactions = totalTransactions;
  }
}
