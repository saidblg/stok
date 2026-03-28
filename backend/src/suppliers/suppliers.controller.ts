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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TransactionsService } from '../transactions/transactions.service';

@ApiTags('suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Yeni tedarikçi oluştur' })
  @ApiResponse({ status: 201, description: 'Tedarikçi başarıyla oluşturuldu' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm tedarikçileri listele' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tedarikçi listesi döndürüldü' })
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.suppliersService.findAll(search, parsedPage, parsedLimit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tedarikçi detayını getir (bakiye bilgisi ile)' })
  @ApiResponse({ status: 200, description: 'Tedarikçi detayı döndürüldü' })
  @ApiResponse({ status: 404, description: 'Tedarikçi bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Tedarikçi bakiye özeti' })
  @ApiResponse({ status: 200, description: 'Bakiye bilgisi döndürüldü' })
  @ApiResponse({ status: 404, description: 'Tedarikçi bulunamadı' })
  getBalance(@Param('id') id: string) {
    return this.suppliersService.getBalance(id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Tedarikçinin işlem geçmişi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  @ApiResponse({ status: 200, description: 'İşlem listesi döndürüldü' })
  @ApiResponse({ status: 404, description: 'Tedarikçi bulunamadı' })
  getTransactions(
    @Param('id') supplierId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: TransactionType,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.transactionsService.findBySupplier(supplierId, parsedPage, parsedLimit, type);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Tedarikçi bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Tedarikçi başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Tedarikçi bulunamadı' })
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tedarikçiyi sil (Sadece Admin)' })
  @ApiResponse({ status: 200, description: 'Tedarikçi başarıyla silindi' })
  @ApiResponse({ status: 403, description: 'Yetki yetersiz' })
  @ApiResponse({ status: 404, description: 'Tedarikçi bulunamadı' })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
