import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionItemResponseDto } from './transaction-item.dto';

class CustomerInfo {
  @ApiProperty({ example: 'clxxxx1234' })
  id: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  name: string;
}

class SupplierInfo {
  @ApiProperty({ example: 'clxxxx5678' })
  id: string;

  @ApiProperty({ example: 'ABC Tedarik Ltd.' })
  name: string;
}

class ProductInfo {
  @ApiProperty({ example: 'clxxxx5678' })
  id: string;

  @ApiProperty({ example: 'Laptop' })
  name: string;

  @ApiProperty({ example: 8000.00 })
  salePrice: number | Decimal;
}

export class TransactionResponseDto {
  @ApiProperty({ example: 'clxxxx9999' })
  id: string;

  @ApiProperty({ example: 'clxxxx1234', nullable: true })
  customerId: string | null;

  @ApiProperty({ type: CustomerInfo, nullable: true })
  customer: CustomerInfo | null;

  @ApiProperty({ example: 'clxxxx5678', nullable: true })
  supplierId: string | null;

  @ApiProperty({ type: SupplierInfo, nullable: true })
  supplier: SupplierInfo | null;

  @ApiProperty({ example: 'clxxxx5678', nullable: true })
  productId: string | null;

  @ApiProperty({ type: ProductInfo, nullable: true })
  product: ProductInfo | null;

  @ApiProperty({ enum: TransactionType, example: 'EXPENSE' })
  type: TransactionType;

  @ApiProperty({ example: 5000.00, description: 'Toplam tutar (tüm kalemlerin toplamı)' })
  amount: number | Decimal;

  @ApiProperty({ example: 5150.00, nullable: true, description: 'Kullanıcının girdiği ham tutar (özellikle PAYMENT)' })
  grossAmount: number | Decimal | null;

  @ApiProperty({ enum: PaymentMethod, nullable: true, example: 'CARD' })
  paymentMethod: PaymentMethod | null;

  @ApiProperty({ type: [TransactionItemResponseDto], description: 'İşlem kalemleri' })
  items: TransactionItemResponseDto[];

  @ApiProperty({ example: 2, nullable: true })
  quantity: number | null;

  @ApiProperty({ example: 'Laptop satışı', nullable: true })
  description: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  date: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  constructor(transaction: any) {
    this.id = transaction.id;
    this.customerId = transaction.customerId;
    this.customer = transaction.customer
      ? {
          id: transaction.customer.id,
          name: transaction.customer.name,
        }
      : null;
    this.supplierId = transaction.supplierId;
    this.supplier = transaction.supplier
      ? {
          id: transaction.supplier.id,
          name: transaction.supplier.name,
        }
      : null;
    this.productId = transaction.productId;
    this.product = transaction.product
      ? {
          id: transaction.product.id,
          name: transaction.product.name,
          salePrice: transaction.product.salePrice,
        }
      : null;
    this.type = transaction.type;
    this.amount = transaction.amount;
    this.grossAmount = transaction.grossAmount ?? null;
    this.paymentMethod = transaction.paymentMethod ?? null;
    this.items = transaction.items
      ? transaction.items.map((item: any) => new TransactionItemResponseDto(item))
      : [];
    this.quantity = transaction.quantity;
    this.description = transaction.description;
    this.date = transaction.date;
    this.createdAt = transaction.createdAt;
    this.updatedAt = transaction.updatedAt;
  }
}
