import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserType } from '../auth/decorators/current-user.decorator';
import { UpdateDashboardCardOrderDto } from './dto/update-dashboard-card-order.dto';
import { DashboardCardOrderResponseDto } from './dto/dashboard-card-order-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur (Sadece Admin)' })
  @ApiResponse({ status: 201, description: 'Kullanıcı başarıyla oluşturuldu', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email adresi zaten kayıtlı' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tüm kullanıcıları listele (Sadece Admin)' })
  @ApiResponse({ status: 200, description: 'Kullanıcı listesi', type: [UserResponseDto] })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('me/dashboard-card-order')
  @ApiOperation({ summary: 'Mevcut kullanıcının dashboard kart sırasını getir' })
  @ApiResponse({ status: 200, description: 'Kart sırası döndürüldü', type: DashboardCardOrderResponseDto })
  async getDashboardCardOrder(@CurrentUser() user: CurrentUserType) {
    return this.usersService.getDashboardCardOrder(user.id);
  }

  @Post('me/dashboard-card-order')
  @ApiOperation({ summary: 'Mevcut kullanıcının dashboard kart sırasını güncelle' })
  @ApiResponse({ status: 200, description: 'Kart sırası güncellendi', type: DashboardCardOrderResponseDto })
  async updateDashboardCardOrder(
    @CurrentUser() user: CurrentUserType,
    @Body() updateDashboardCardOrderDto: UpdateDashboardCardOrderDto,
  ) {
    return this.usersService.updateDashboardCardOrder(
      user.id,
      updateDashboardCardOrderDto.dashboardCardOrder,
    );
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Kullanıcı detayını getir (Sadece Admin)' })
  @ApiResponse({ status: 200, description: 'Kullanıcı detayı', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Kullanıcı sil (Sadece Admin)' })
  @ApiResponse({ status: 200, description: 'Kullanıcı başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  @ApiResponse({ status: 403, description: 'Yetkisiz erişim' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
