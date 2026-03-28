import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { CustomerDetailDto, CustomerBalanceDto } from './dto/customer-detail.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const normalizedData = this.normalizeCustomerData(createCustomerDto);

    const customer = await this.prisma.customer.create({
      data: normalizedData,
    });

    return new CustomerResponseDto(customer);
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

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers.map(customer => new CustomerResponseDto(customer)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<CustomerDetailDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const balanceInfo = await this.calculateBalance(id);
    const totalTransactions = await this.prisma.customerTransaction.count({
      where: { customerId: id },
    });

    return new CustomerDetailDto(customer, balanceInfo, totalTransactions);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const normalizedData = this.normalizeCustomerData(updateCustomerDto);

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: normalizedData,
    });

    return new CustomerResponseDto(updatedCustomer);
  }

  async remove(id: string): Promise<{ message: string }> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    await this.prisma.customer.delete({
      where: { id },
    });

    return { message: 'Müşteri başarıyla silindi' };
  }

  async calculateBalance(customerId: string): Promise<CustomerBalanceDto> {
    const transactions = await this.prisma.customerTransaction.findMany({
      where: { customerId },
      select: {
        type: true,
        amount: true,
      },
    });

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalExpense - totalIncome;

    return {
      totalExpense: new Decimal(totalExpense),
      totalIncome: new Decimal(totalIncome),
      balance: new Decimal(balance),
    };
  }

  async getBalance(id: string): Promise<CustomerBalanceDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    return this.calculateBalance(id);
  }

  private normalizeCustomerData(data: Partial<CreateCustomerDto>) {
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
