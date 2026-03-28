import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni işlem oluştur (satış veya tahsilat)' })
  @ApiResponse({ status: 201, description: 'İşlem başarıyla oluşturuldu' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  @ApiResponse({ status: 404, description: 'Müşteri veya ürün bulunamadı' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm işlemleri listele (filtreleme destekli)' })
  @ApiResponse({ status: 200, description: 'İşlem listesi döndürüldü' })
  findAll(@Query() query: TransactionQueryDto) {
    return this.transactionsService.findAll(query);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Müşteriye ait işlemleri listele' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Müşteri işlemleri döndürüldü' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  findByCustomer(
    @Param('customerId') customerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.transactionsService.findByCustomer(customerId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'İşlem detayını getir' })
  @ApiResponse({ status: 200, description: 'İşlem detayı döndürüldü' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'İşlem bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'İşlem başarıyla güncellendi' })
  @ApiResponse({ status: 400, description: 'Geçersiz veri' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'İşlemi sil (Sadece Admin)' })
  @ApiResponse({ status: 200, description: 'İşlem başarıyla silindi' })
  @ApiResponse({ status: 403, description: 'Yetki yetersiz' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
