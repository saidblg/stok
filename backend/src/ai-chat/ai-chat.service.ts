import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface BusinessContext {
  summary: {
    totalProducts: number;
    totalCustomers: number;
    totalSuppliers: number;
    lowStockCount: number;
    totalIncome: number;
    totalExpense: number;
    totalBalance: number;
    supplierDebt: number;
  };
  topSellingProducts: Array<{
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topCustomers: Array<{
    name: string;
    totalPurchases: number;
    balance: number;
  }>;
  lowStockProducts: Array<{
    name: string;
    stock: number;
    threshold: number;
  }>;
  recentTransactions: Array<{
    type: string;
    amount: number;
    customerName?: string;
    supplierName?: string;
    date: Date;
  }>;
  monthlyStats: {
    currentMonthIncome: number;
    currentMonthExpense: number;
    lastMonthIncome: number;
    lastMonthExpense: number;
  };
}

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  async chat(message: string): Promise<string> {
    if (!this.model) {
      return 'AI servisi yapılandırılmamış. Lütfen GEMINI_API_KEY ayarlayın.';
    }

    try {
      // İş verilerini topla
      const context = await this.gatherBusinessContext();

      // AI'a gönderilecek prompt'u oluştur
      const prompt = this.buildPrompt(message, context);

      // Gemini'ye gönder
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text;
    } catch (error) {
      this.logger.error('AI Chat hatası:', error);
      return 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }

  private async gatherBusinessContext(): Promise<BusinessContext> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Paralel sorgular
    const [
      totalProducts,
      totalCustomers,
      totalSuppliers,
      allProducts,
      allTransactions,
      currentMonthTransactions,
      lastMonthTransactions,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.customer.count(),
      this.prisma.supplier.count(),
      this.prisma.product.findMany({
        select: { id: true, name: true, stock: true, lowStockThreshold: true, salePrice: true },
      }),
      this.prisma.customerTransaction.findMany({
        select: { type: true, amount: true },
      }),
      this.prisma.customerTransaction.findMany({
        where: { date: { gte: startOfMonth } },
        select: { type: true, amount: true },
      }),
      this.prisma.customerTransaction.findMany({
        where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } },
        select: { type: true, amount: true },
      }),
      this.prisma.customerTransaction.findMany({
        take: 20,
        orderBy: { date: 'desc' },
        include: { customer: true, supplier: true },
      }),
    ]);

    // En çok satan ürünler
    const topSellingProducts = await this.prisma.transactionItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const productMap = new Map(allProducts.map(p => [p.id, p]));
    const topSelling = topSellingProducts.map(item => ({
      name: productMap.get(item.productId)?.name || 'Bilinmeyen',
      totalQuantity: item._sum.quantity || 0,
      totalRevenue: Number(item._sum.subtotal) || 0,
    }));

    // En iyi müşteriler
    const customerTransactions = await this.prisma.customerTransaction.groupBy({
      by: ['customerId'],
      where: { customerId: { not: null }, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    });

    const customerIds = customerTransactions.map(ct => ct.customerId).filter(Boolean) as string[];
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: customerIds } },
    });
    const customerMap = new Map(customers.map(c => [c.id, c]));

    // Müşteri bakiyeleri hesapla
    const topCustomers = await Promise.all(
      customerTransactions.map(async (ct) => {
        const customer = customerMap.get(ct.customerId!);
        const transactions = await this.prisma.customerTransaction.findMany({
          where: { customerId: ct.customerId },
          select: { type: true, amount: true },
        });

        const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
        const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

        return {
          name: customer?.name || 'İsimsiz Müşteri',
          totalPurchases: Number(ct._sum.amount) || 0,
          balance: expense - income, // Pozitif = müşteri borçlu
        };
      })
    );

    // Düşük stoklu ürünler
    const lowStockProducts = allProducts
      .filter(p => p.stock <= p.lowStockThreshold)
      .map(p => ({
        name: p.name,
        stock: p.stock,
        threshold: p.lowStockThreshold,
      }));

    // Özet hesaplamalar
    const totalIncome = allTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = allTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
    const totalPurchases = allTransactions.filter(t => t.type === 'PURCHASE').reduce((s, t) => s + Number(t.amount), 0);
    const totalPayments = allTransactions.filter(t => t.type === 'PAYMENT').reduce((s, t) => s + Number(t.amount), 0);

    // Aylık istatistikler
    const currentMonthIncome = currentMonthTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    const currentMonthExpense = currentMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
    const lastMonthIncome = lastMonthTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    const lastMonthExpense = lastMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

    return {
      summary: {
        totalProducts,
        totalCustomers,
        totalSuppliers,
        lowStockCount: lowStockProducts.length,
        totalIncome,
        totalExpense,
        totalBalance: totalExpense - totalIncome, // Pozitif = müşterilerden alacak
        supplierDebt: totalPurchases - totalPayments,
      },
      topSellingProducts: topSelling,
      topCustomers,
      lowStockProducts,
      recentTransactions: recentTransactions.map(t => ({
        type: t.type,
        amount: Number(t.amount),
        customerName: t.customer?.name || undefined,
        supplierName: t.supplier?.name || undefined,
        date: t.date,
      })),
      monthlyStats: {
        currentMonthIncome,
        currentMonthExpense,
        lastMonthIncome,
        lastMonthExpense,
      },
    };
  }

  private buildPrompt(userMessage: string, context: BusinessContext): string {
    return `Sen Karabacak Gıda şirketinin akıllı iş asistanısın. Türkçe yanıt ver.
Görevin: İşletme verilerini analiz etmek, stratejik öneriler sunmak ve soruları yanıtlamak.

## GÜNCEL İŞLETME VERİLERİ

### Genel Özet
- Toplam Ürün: ${context.summary.totalProducts}
- Toplam Müşteri: ${context.summary.totalCustomers}
- Toplam Tedarikçi: ${context.summary.totalSuppliers}
- Düşük Stoklu Ürün: ${context.summary.lowStockCount}
- Toplam Tahsilat: ${context.summary.totalIncome.toLocaleString('tr-TR')} ₺
- Toplam Satış: ${context.summary.totalExpense.toLocaleString('tr-TR')} ₺
- Müşteri Bakiyesi (Alacak): ${context.summary.totalBalance.toLocaleString('tr-TR')} ₺
- Tedarikçi Borcu: ${context.summary.supplierDebt.toLocaleString('tr-TR')} ₺

### Bu Ay vs Geçen Ay
- Bu Ay Tahsilat: ${context.monthlyStats.currentMonthIncome.toLocaleString('tr-TR')} ₺
- Bu Ay Satış: ${context.monthlyStats.currentMonthExpense.toLocaleString('tr-TR')} ₺
- Geçen Ay Tahsilat: ${context.monthlyStats.lastMonthIncome.toLocaleString('tr-TR')} ₺
- Geçen Ay Satış: ${context.monthlyStats.lastMonthExpense.toLocaleString('tr-TR')} ₺

### En Çok Satan Ürünler (Top 10)
${context.topSellingProducts.map((p, i) => `${i + 1}. ${p.name}: ${p.totalQuantity} adet, ${p.totalRevenue.toLocaleString('tr-TR')} ₺`).join('\n') || 'Henüz satış verisi yok'}

### En İyi Müşteriler (Top 10)
${context.topCustomers.map((c, i) => `${i + 1}. ${c.name}: ${c.totalPurchases.toLocaleString('tr-TR')} ₺ alışveriş, ${c.balance > 0 ? c.balance.toLocaleString('tr-TR') + ' ₺ borçlu' : 'Borcu yok'}`).join('\n') || 'Henüz müşteri verisi yok'}

### Düşük Stoklu Ürünler
${context.lowStockProducts.map(p => `- ${p.name}: ${p.stock} adet (eşik: ${p.threshold})`).join('\n') || 'Düşük stoklu ürün yok'}

### Son İşlemler
${context.recentTransactions.slice(0, 5).map(t => {
  const party = t.customerName || t.supplierName || 'Bilinmeyen';
  const typeLabel = t.type === 'INCOME' ? 'Tahsilat' : t.type === 'EXPENSE' ? 'Satış' : t.type === 'PURCHASE' ? 'Alış' : 'Ödeme';
  return `- ${typeLabel}: ${t.amount.toLocaleString('tr-TR')} ₺ (${party})`;
}).join('\n') || 'Son işlem yok'}

## KURALLAR
1. Her zaman Türkçe yanıt ver
2. Yanıtlarını kısa ve öz tut (maksimum 3-4 paragraf)
3. Stratejik öneriler sun
4. Verileri analiz ederken somut rakamlar kullan
5. Emoji kullanabilirsin ama abartma
6. Eğer bir veri yoksa veya sıfırsa, bunu belirt

## KULLANICI SORUSU
${userMessage}

Lütfen yukarıdaki verileri kullanarak bu soruyu yanıtla ve gerekirse stratejik öneriler sun.`;
  }
}
