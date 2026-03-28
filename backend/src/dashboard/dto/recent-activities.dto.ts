import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

class RecentActivityDto {
  @ApiProperty({ example: 'clxxxx9999' })
  id: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  customerName: string;

  @ApiProperty({ enum: TransactionType, example: 'EXPENSE' })
  type: TransactionType;

  @ApiProperty({ example: 5000.00 })
  amount: number | Decimal;

  @ApiProperty({ example: 'Laptop satışı' })
  description: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  date: Date;

  @ApiProperty({ example: 'Laptop', nullable: true })
  productName: string | null;

  @ApiProperty({ example: 2, nullable: true })
  quantity: number | null;
}

export class RecentActivitiesDto {
  @ApiProperty({ type: [RecentActivityDto] })
  activities: RecentActivityDto[];

  constructor(activities: any[]) {
    this.activities = activities.map(activity => ({
      id: activity.id,
      customerName: activity.customer?.name || activity.supplier?.name || 'İşlem',
      type: activity.type,
      amount: activity.amount,
      description: activity.description,
      date: activity.date,
      productName: activity.items?.[0]?.product?.name || null,
      quantity: activity.items
        ? activity.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        : null,
    }));
  }
}
