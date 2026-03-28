import { ApiProperty } from '@nestjs/swagger';

export class SupplierResponseDto {
  @ApiProperty({ example: 'clxxxx1234' })
  id: string;

  @ApiProperty({ example: 'ABC Tedarik Ltd.' })
  name: string | null;

  @ApiProperty({ example: '0532 123 45 67', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'info@abctedarik.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: 'İstanbul, Türkiye', nullable: true })
  address: string | null;

  @ApiProperty({ example: 'Güvenilir tedarikçi', nullable: true })
  notes: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  constructor(supplier: any) {
    this.id = supplier.id;
    this.name = supplier.name;
    this.phone = supplier.phone;
    this.email = supplier.email;
    this.address = supplier.address;
    this.notes = supplier.notes;
    this.createdAt = supplier.createdAt;
    this.updatedAt = supplier.updatedAt;
  }
}
