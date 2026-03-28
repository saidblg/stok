import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayUnique, IsIn } from 'class-validator';

const DASHBOARD_CARD_KEYS = [
  'totalBalance',
  'totalExpense',
  'totalIncome',
  'totalPurchases',
  'supplierDebt',
  'totalCustomers',
  'totalSuppliers',
  'totalProducts',
  'lowStockCount',
] as const;

export class UpdateDashboardCardOrderDto {
  @ApiProperty({
    type: [String],
    enum: DASHBOARD_CARD_KEYS,
    example: [
      'totalBalance',
      'totalExpense',
      'totalIncome',
      'totalPurchases',
      'supplierDebt',
      'totalCustomers',
      'totalSuppliers',
      'totalProducts',
      'lowStockCount',
    ],
  })
  @IsArray({ message: 'dashboardCardOrder bir dizi olmalıdır' })
  @ArrayUnique({ message: 'dashboardCardOrder tekrar eden değer içeremez' })
  @IsIn(DASHBOARD_CARD_KEYS, {
    each: true,
    message: 'dashboardCardOrder geçersiz kart anahtarı içeriyor',
  })
  dashboardCardOrder: string[];
}

export { DASHBOARD_CARD_KEYS };
