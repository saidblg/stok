import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Dashboard özet istatistikleri' })
  @ApiQuery({ name: 'period', required: false, enum: ['1m', '3m', '6m', 'all'] })
  @ApiResponse({ status: 200, description: 'Özet istatistikler döndürüldü' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  getSummary(@Query('period') period?: '1m' | '3m' | '6m' | 'all') {
    const safePeriod: '1m' | '3m' | '6m' | 'all' =
      period === '3m' || period === '6m' || period === 'all' ? period : '1m';
    return this.dashboardService.getSummary(safePeriod);
  }

  @Get('recent-transactions')
  @ApiOperation({ summary: 'Son işlemleri getir' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Son işlemler döndürüldü' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  getRecentTransactions(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getRecentTransactions(parsedLimit);
  }

  @Get('low-stock-products')
  @ApiOperation({ summary: 'Düşük stoklu ürünleri getir' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Düşük stoklu ürünler döndürüldü' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  getLowStockProducts(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const safeLimit =
      parsedLimit !== undefined && Number.isFinite(parsedLimit) && parsedLimit > 0
        ? parsedLimit
        : undefined;
    return this.dashboardService.getLowStockProducts(safeLimit);
  }
}
