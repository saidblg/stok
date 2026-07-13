import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EkstreService } from './ekstre.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EkstreQueryDto, EntityType } from './dto/ekstre-query.dto';

@ApiTags('ekstre')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ekstre')
export class EkstreController {
  constructor(private readonly ekstreService: EkstreService) {}

  @Get('preview')
  @ApiOperation({ summary: 'Ekstre önizleme - JSON veri' })
  @ApiQuery({ name: 'entityType', required: false, enum: EntityType })
  @ApiQuery({ name: 'entityId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Ekstre verisi döndü' })
  @ApiResponse({ status: 404, description: 'Müşteri/Tedarikçi bulunamadı' })
  async preview(@Query() query: EkstreQueryDto) {
    return this.ekstreService.generateStatement(query);
  }

  @Get('download')
  @ApiOperation({ summary: 'Ekstre Excel indir' })
  @ApiQuery({ name: 'entityType', required: false, enum: EntityType })
  @ApiQuery({ name: 'entityId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Excel dosyası indirildi' })
  async download(@Query() query: EkstreQueryDto, @Res() res: Response) {
    const buffer = await this.ekstreService.generateExcel(query);

    const entityTypeLabel = query.entityType === EntityType.SUPPLIER ? 'tedarikci' : 'musteri';
    const filename = `ekstre_${entityTypeLabel}_${query.entityId}_${query.startDate}_${query.endDate}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
