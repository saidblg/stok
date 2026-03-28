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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadsService } from '../uploads/uploads.service';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Yeni ürün oluştur' })
  @ApiResponse({ status: 201, description: 'Ürün başarıyla oluşturuldu' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm ürünleri listele' })
  @ApiResponse({ status: 200, description: 'Ürün listesi döndürüldü' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ürün detayını getir' })
  @ApiResponse({ status: 200, description: 'Ürün detayı döndürüldü' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ürün bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Ürün başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Ürünü sil (Sadece Admin)' })
  @ApiResponse({ status: 200, description: 'Ürün başarıyla silindi' })
  @ApiResponse({ status: 403, description: 'Yetki yetersiz' })
  @ApiResponse({ status: 404, description: 'Ürün bulunamadı' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Ürün resmi yükle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Resim başarıyla yüklendi' })
  @ApiResponse({ status: 400, description: 'Geçersiz dosya' })
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenmedi');
    }

    const { url } = await this.uploadsService.uploadProductImage(file);
    const product = await this.productsService.updateProductImage(id, url);

    return { url: product.image };
  }
}
