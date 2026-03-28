import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { Decimal } from '@prisma/client/runtime/library';

type DashboardPeriod = '1m' | '3m' | '6m' | 'all';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(period: DashboardPeriod = '1m'): Promise<DashboardSummaryDto> {
    const filteredDateFrom = this.getDateFromPeriod(period);

    const [allTransactions, filteredTransactions, totalCustomers, totalSuppliers, totalProducts, allProducts] = await Promise.all([
      this.prisma.customerTransaction.findMany({
        select: {
          type: true,
          amount: true,
        },
      }),
      this.prisma.customerTransaction.findMany({
        where: filteredDateFrom ? { date: { gte: filteredDateFrom } } : undefined,
        select: {
          type: true,
          amount: true,
        },
      }),
      this.prisma.customer.count(),
      this.prisma.supplier.count(),
      this.prisma.product.count(),
      this.prisma.product.findMany({
        select: {
          stock: true,
          lowStockThreshold: true,
        },
      }),
    ]);

    const lowStockProducts = allProducts.filter(
      (product) => product.stock <= product.lowStockThreshold,
    ).length;

    // Filtered by selected period
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Filtered by selected period
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Filtered by selected period
    const totalPurchases = filteredTransactions
      .filter(t => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // All-time values below intentionally keep existing behavior
    const totalSupplierPayments = allTransactions
      .filter(t => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const allTimeIncome = allTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const allTimeExpense = allTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const allTimePurchases = allTransactions
      .filter(t => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalBalance = allTimeExpense - allTimeIncome;
    const supplierDebt = allTimePurchases - totalSupplierPayments;

    return new DashboardSummaryDto({
      totalIncome: new Decimal(totalIncome),
      totalExpense: new Decimal(totalExpense),
      totalBalance: new Decimal(totalBalance),
      totalCustomers,
      totalProducts,
      lowStockCount: lowStockProducts,
      totalPurchases: new Decimal(totalPurchases),
      totalSuppliers,
      supplierDebt: new Decimal(supplierDebt),
    });
  }

  private getDateFromPeriod(period: DashboardPeriod): Date | null {
    if (period === 'all') {
      return null;
    }

    const now = new Date();
    const date = new Date(now);

    if (period === '1m') {
      date.setMonth(date.getMonth() - 1);
      return date;
    }

    if (period === '3m') {
      date.setMonth(date.getMonth() - 3);
      return date;
    }

    date.setMonth(date.getMonth() - 6);
    return date;
  }

  async getRecentTransactions(limit = 10) {
    const transactions = await this.prisma.customerTransaction.findMany({
      take: limit,
      orderBy: {
        date: 'desc',
      },
      include: {
        customer: true,
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return transactions;
  }

  async getLowStockProducts(limit?: number) {
    const allProducts = await this.prisma.product.findMany({
      orderBy: {
        stock: 'asc',
      },
    });

    const lowStockProducts = allProducts.filter(
      (product) => product.stock <= product.lowStockThreshold,
    );

    if (!limit) {
      return lowStockProducts;
    }

    return lowStockProducts.slice(0, limit);
  }
}
