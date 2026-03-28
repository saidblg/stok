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
import { TransactionType } from '@prisma/client';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TransactionsService } from '../transactions/transactions.service';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Yeni müşteri oluştur' })
  @ApiResponse({ status: 201, description: 'Müşteri başarıyla oluşturuldu' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm müşterileri listele' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Müşteri listesi döndürüldü' })
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.customersService.findAll(search, parsedPage, parsedLimit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Müşteri detayını getir (bakiye bilgisi ile)' })
  @ApiResponse({ status: 200, description: 'Müşteri detayı döndürüldü' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Müşteri bakiye özeti' })
  @ApiResponse({ status: 200, description: 'Bakiye bilgisi döndürüldü' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  getBalance(@Param('id') id: string) {
    return this.customersService.getBalance(id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Müşterinin işlem geçmişi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  @ApiResponse({ status: 200, description: 'İşlem listesi döndürüldü' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  getTransactions(
    @Param('id') customerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: TransactionType,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.transactionsService.findByCustomer(customerId, parsedPage, parsedLimit, type);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Müşteri bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Müşteri başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Müşteriyi sil (Sadece Admin)' })
  @ApiResponse({ status: 200, description: 'Müşteri başarıyla silindi' })
  @ApiResponse({ status: 403, description: 'Yetki yetersiz' })
  @ApiResponse({ status: 404, description: 'Müşteri bulunamadı' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
