import { ApiProperty } from '@nestjs/swagger';

export class DashboardCardOrderResponseDto {
  @ApiProperty({ type: [String] })
  dashboardCardOrder: string[];
}
