import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class DashboardSummaryDto {
  @ApiProperty({ example: 150000.00, description: 'Toplam tahsilatlar (INCOME)' })
  totalIncome: number | Decimal;

  @ApiProperty({ example: 250000.00, description: 'Toplam satışlar/giderler (EXPENSE)' })
  totalExpense: number | Decimal;

  @ApiProperty({ example: 100000.00, description: 'Toplam bakiye (Expense - Income, pozitif = müşteriler borçlu)' })
  totalBalance: number | Decimal;

  @ApiProperty({ example: 45, description: 'Toplam müşteri sayısı' })
  totalCustomers: number;

  @ApiProperty({ example: 120, description: 'Toplam ürün sayısı' })
  totalProducts: number;

  @ApiProperty({ example: 8, description: 'Düşük stoklu ürün sayısı' })
  lowStockCount: number;

  @ApiProperty({ example: 180000.00, description: 'Toplam mal alışları (PURCHASE)' })
  totalPurchases: number | Decimal;

  @ApiProperty({ example: 25, description: 'Toplam tedarikçi sayısı' })
  totalSuppliers: number;

  @ApiProperty({ example: 180000.00, description: 'Tedarikçilere borç (PURCHASE - PAYMENT net)' })
  supplierDebt: number | Decimal;

  constructor(data: {
    totalIncome: number | Decimal;
    totalExpense: number | Decimal;
    totalBalance: number | Decimal;
    totalCustomers: number;
    totalProducts: number;
    lowStockCount: number;
    totalPurchases: number | Decimal;
    totalSuppliers: number;
    supplierDebt: number | Decimal;
  }) {
    this.totalIncome = data.totalIncome;
    this.totalExpense = data.totalExpense;
    this.totalBalance = data.totalBalance;
    this.totalCustomers = data.totalCustomers;
    this.totalProducts = data.totalProducts;
    this.lowStockCount = data.lowStockCount;
    this.totalPurchases = data.totalPurchases;
    this.totalSuppliers = data.totalSuppliers;
    this.supplierDebt = data.supplierDebt;
  }
}
