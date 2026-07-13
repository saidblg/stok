import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from './ekstre-query.dto';

export class EkstreEntityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: EntityType })
  type: EntityType;
}

export class EkstreRowDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  description: string;

  @ApiProperty({ description: 'Borç (ödeme yapıldı)' })
  borc: number;

  @ApiProperty({ description: 'Alacak (borçlanma)' })
  alacak: number;

  @ApiProperty({ description: 'Kümülatif bakiye' })
  bakiye: number;
}

export class EkstreResponseDto {
  @ApiProperty({ type: EkstreEntityDto })
  entity: EkstreEntityDto;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty({ description: 'Dönem öncesi bakiye' })
  openingBalance: number;

  @ApiProperty({ description: 'Dönem sonu bakiye' })
  closingBalance: number;

  @ApiProperty({ type: [EkstreRowDto] })
  rows: EkstreRowDto[];
}
