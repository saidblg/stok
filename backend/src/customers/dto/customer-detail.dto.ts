import { ApiProperty } from '@nestjs/swagger';
import { CustomerResponseDto } from './customer-response.dto';
import { Decimal } from '@prisma/client/runtime/library';

export class CustomerBalanceDto {
  @ApiProperty({ example: 15000.00, description: 'Toplam satış/borç (EXPENSE)' })
  totalExpense: number | Decimal;

  @ApiProperty({ example: 10000.00, description: 'Toplam tahsilat (INCOME)' })
  totalIncome: number | Decimal;

  @ApiProperty({ example: 5000.00, description: 'Bakiye (pozitif = müşteri borçlu, negatif = size borçlu)' })
  balance: number | Decimal;
}

export class CustomerDetailDto extends CustomerResponseDto {
  @ApiProperty({ type: CustomerBalanceDto })
  balance: CustomerBalanceDto;

  @ApiProperty({ example: 5, description: 'Toplam işlem sayısı' })
  totalTransactions: number;

  constructor(customer: any, balanceInfo: CustomerBalanceDto, totalTransactions: number) {
    super(customer);
    this.balance = balanceInfo;
    this.totalTransactions = totalTransactions;
  }
}
