import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: 'ok';

  @ApiProperty({ example: '2026-07-29T09:15:42.031Z', format: 'date-time' })
  timestamp: string;
}
