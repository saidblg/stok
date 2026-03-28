import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: 'clxxxx1234' })
  id: string;

  @ApiProperty({ example: 'Ahmet Yılmaz' })
  name: string | null;

  @ApiProperty({ example: '0532 123 45 67', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'ahmet@example.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: 'İstanbul, Türkiye', nullable: true })
  address: string | null;

  @ApiProperty({ example: 'VIP müşteri', nullable: true })
  notes: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  constructor(customer: any) {
    this.id = customer.id;
    this.name = customer.name;
    this.phone = customer.phone;
    this.email = customer.email;
    this.address = customer.address;
    this.notes = customer.notes;
    this.createdAt = customer.createdAt;
    this.updatedAt = customer.updatedAt;
  }
}
