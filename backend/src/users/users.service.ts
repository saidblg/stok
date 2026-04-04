import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { DASHBOARD_CARD_KEYS } from './dto/update-dashboard-card-order.dto';
import { THEME_PREFERENCES } from './dto/update-theme-preference.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Bu email adresi zaten kayıtlı');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: createUserDto.role || 'USER',
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        themePreference: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        themePreference: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return user;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Kullanıcı başarıyla silindi' };
  }

  async getDashboardCardOrder(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, dashboardCardOrder: true },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return {
      dashboardCardOrder: this.normalizeDashboardCardOrder(user.dashboardCardOrder),
    };
  }

  async updateDashboardCardOrder(userId: string, dashboardCardOrder: string[]) {
    const normalizedOrder = this.normalizeDashboardCardOrder(dashboardCardOrder);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        dashboardCardOrder: normalizedOrder,
      },
      select: {
        dashboardCardOrder: true,
      },
    });

    return {
      dashboardCardOrder: user.dashboardCardOrder,
    };
  }

  async getThemePreference(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, themePreference: true },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    return {
      themePreference: this.normalizeThemePreference(user.themePreference),
    };
  }

  async updateThemePreference(userId: string, themePreference: 'light' | 'dark') {
    const normalizedTheme = this.normalizeThemePreference(themePreference);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        themePreference: normalizedTheme,
      },
      select: {
        themePreference: true,
      },
    });

    return {
      themePreference: this.normalizeThemePreference(user.themePreference),
    };
  }

  private normalizeDashboardCardOrder(order?: string[]): string[] {
    const allowedKeys = [...DASHBOARD_CARD_KEYS];

    if (!order || order.length === 0) {
      return allowedKeys;
    }

    const uniqueValid = order.filter((key, index, arr) => {
      return allowedKeys.includes(key as (typeof DASHBOARD_CARD_KEYS)[number]) && arr.indexOf(key) === index;
    });

    if (uniqueValid.length !== allowedKeys.length) {
      return allowedKeys;
    }

    return uniqueValid;
  }

  private normalizeThemePreference(themePreference?: string): 'light' | 'dark' {
    return THEME_PREFERENCES.includes(themePreference as 'light' | 'dark')
      ? (themePreference as 'light' | 'dark')
      : 'light';
  }
}
