import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { SupplierDetailDto, SupplierBalanceDto } from './dto/supplier-detail.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const normalizedData = this.normalizeSupplierData(createSupplierDto);

    const supplier = await this.prisma.supplier.create({
      data: normalizedData,
    });

    return new SupplierResponseDto(supplier);
  }

  async findAll(search?: string, page = 1, limit = 10) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers.map((supplier) => new SupplierResponseDto(supplier)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<SupplierDetailDto> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Tedarikçi bulunamadı');
    }

    const balanceInfo = await this.calculateBalance(id);
    const totalTransactions = await this.prisma.customerTransaction.count({
      where: { supplierId: id },
    });

    return new SupplierDetailDto(supplier, balanceInfo, totalTransactions);
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Tedarikçi bulunamadı');
    }

    const normalizedData = this.normalizeSupplierData(updateSupplierDto);

    const updatedSupplier = await this.prisma.supplier.update({
      where: { id },
      data: normalizedData,
    });

    return new SupplierResponseDto(updatedSupplier);
  }

  async remove(id: string): Promise<{ message: string }> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Tedarikçi bulunamadı');
    }

    await this.prisma.supplier.delete({
      where: { id },
    });

    return { message: 'Tedarikçi başarıyla silindi' };
  }

  async calculateBalance(supplierId: string): Promise<SupplierBalanceDto> {
    const transactions = await this.prisma.customerTransaction.findMany({
      where: { supplierId },
      select: {
        type: true,
        amount: true,
      },
    });

    const totalPurchases = transactions
      .filter((t) => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPayments = transactions
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalPurchases - totalPayments;

    return {
      totalPurchases: new Decimal(totalPurchases),
      totalPayments: new Decimal(totalPayments),
      balance: new Decimal(balance),
    };
  }

  async getBalance(id: string): Promise<SupplierBalanceDto> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException('Tedarikçi bulunamadı');
    }

    return this.calculateBalance(id);
  }

  private normalizeSupplierData(data: Partial<CreateSupplierDto>) {
    const normalize = (value?: string) => {
      if (value === undefined) {
        return undefined;
      }
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    };

    return {
      name: normalize(data.name),
      phone: normalize(data.phone),
      email: normalize(data.email),
      address: normalize(data.address),
      notes: normalize(data.notes),
    };
  }
}
