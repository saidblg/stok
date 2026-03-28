import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentMethod, Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

interface AggregatedItem {
  productId: string;
  quantity: number;
}

interface ProcessedItem extends AggregatedItem {
  unitPrice: number;
  subtotal: number;
}

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    this.validateCreatePayload(createTransactionDto);

    return this.prisma.$transaction(async (tx) => {
      await this.assertRelatedEntityExists(
        tx,
        createTransactionDto.type,
        createTransactionDto.customerId,
        createTransactionDto.supplierId,
      );

      let totalAmount = createTransactionDto.amount ?? 0;
      let grossAmount: number | null = null;
      let processedItems: ProcessedItem[] = [];

      if (createTransactionDto.type === TransactionType.EXPENSE || createTransactionDto.type === TransactionType.PURCHASE) {
        const result = await this.prepareAndApplyItems(tx, {
          type: createTransactionDto.type,
          items: createTransactionDto.items || [],
        });
        processedItems = result.items;
        totalAmount = result.totalAmount;
      }

      if (createTransactionDto.type === TransactionType.INCOME) {
        totalAmount = this.roundMoney(createTransactionDto.amount!);
      }

      if (createTransactionDto.type === TransactionType.PAYMENT) {
        grossAmount = this.roundMoney(createTransactionDto.amount!);
        totalAmount = this.calculateEffectivePayment(grossAmount, createTransactionDto.paymentMethod!);
      }

      const transaction = await tx.customerTransaction.create({
        data: {
          customerId: this.requiresCustomer(createTransactionDto.type) ? createTransactionDto.customerId : null,
          supplierId: this.requiresSupplier(createTransactionDto.type) ? createTransactionDto.supplierId : null,
          type: createTransactionDto.type,
          paymentMethod: createTransactionDto.type === TransactionType.PAYMENT ? createTransactionDto.paymentMethod : null,
          grossAmount,
          amount: totalAmount,
          description: this.normalizeOptionalString(createTransactionDto.description),
          date: createTransactionDto.date ? new Date(createTransactionDto.date) : new Date(),
          items: processedItems.length > 0 ? { create: processedItems } : undefined,
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

      return new TransactionResponseDto(transaction);
    });
  }

  async findAll(query: TransactionQueryDto) {
    const { customerId, type, startDate, endDate, page = 1, limit = 10 } = query;

    const where: Prisma.CustomerTransactionWhereInput = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.customerTransaction.findMany({
        where,
        include: {
          customer: true,
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customerTransaction.count({ where }),
    ]);

    return {
      data: transactions.map((transaction) => new TransactionResponseDto(transaction)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<TransactionResponseDto> {
    const transaction = await this.prisma.customerTransaction.findUnique({
      where: { id },
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

    if (!transaction) {
      throw new NotFoundException('İşlem bulunamadı');
    }

    return new TransactionResponseDto(transaction);
  }

  async findByCustomer(
    customerId: string,
    page = 1,
    limit = 10,
    type?: TransactionType,
  ) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });

    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    const where: Prisma.CustomerTransactionWhereInput = { customerId };
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.customerTransaction.findMany({
        where,
        include: {
          customer: true,
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customerTransaction.count({ where }),
    ]);

    return {
      data: transactions.map((transaction) => new TransactionResponseDto(transaction)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySupplier(
    supplierId: string,
    page = 1,
    limit = 10,
    type?: TransactionType,
  ) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });

    if (!supplier) {
      throw new NotFoundException('Tedarikçi bulunamadı');
    }

    const where: Prisma.CustomerTransactionWhereInput = { supplierId };
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.customerTransaction.findMany({
        where,
        include: {
          customer: true,
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customerTransaction.count({ where }),
    ]);

    return {
      data: transactions.map((transaction) => new TransactionResponseDto(transaction)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<TransactionResponseDto> {
    const existingTransaction = await this.prisma.customerTransaction.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingTransaction) {
      throw new NotFoundException('İşlem bulunamadı');
    }

    if (updateTransactionDto.type && updateTransactionDto.type !== existingTransaction.type) {
      throw new BadRequestException('İşlem tipi değiştirilemez');
    }

    const transactionType = existingTransaction.type;

    const nextCustomerId =
      updateTransactionDto.customerId !== undefined ? updateTransactionDto.customerId : existingTransaction.customerId;
    const nextSupplierId =
      updateTransactionDto.supplierId !== undefined ? updateTransactionDto.supplierId : existingTransaction.supplierId;

    this.validatePartyCombination(transactionType, nextCustomerId, nextSupplierId);
    this.validateUpdatePayload(transactionType, updateTransactionDto, existingTransaction);

    return this.prisma.$transaction(async (tx) => {
      await this.assertRelatedEntityExists(tx, transactionType, nextCustomerId, nextSupplierId);

      const shouldReplaceItems =
        (transactionType === TransactionType.EXPENSE || transactionType === TransactionType.PURCHASE) &&
        updateTransactionDto.items !== undefined;

      let recalculatedAmount: number | undefined;

      if (shouldReplaceItems) {
        await this.rollbackItems(tx, id, existingTransaction.type, existingTransaction.items);

        const result = await this.prepareAndApplyItems(tx, {
          type: transactionType,
          items: updateTransactionDto.items || [],
        });
        recalculatedAmount = result.totalAmount;

        await tx.transactionItem.createMany({
          data: result.items.map((item) => ({
            transactionId: id,
            ...item,
          })),
        });
      }

      const updateData: Prisma.CustomerTransactionUncheckedUpdateInput = {
        customerId: this.requiresCustomer(transactionType) ? nextCustomerId : null,
        supplierId: this.requiresSupplier(transactionType) ? nextSupplierId : null,
        description:
          updateTransactionDto.description !== undefined
            ? this.normalizeOptionalString(updateTransactionDto.description)
            : undefined,
        date: updateTransactionDto.date ? new Date(updateTransactionDto.date) : undefined,
      };

      if (transactionType === TransactionType.INCOME) {
        if (updateTransactionDto.amount !== undefined) {
          if (updateTransactionDto.amount <= 0) {
            throw new BadRequestException('INCOME işleminde tutar 0’dan büyük olmalıdır');
          }
          updateData.amount = this.roundMoney(updateTransactionDto.amount);
        }
        updateData.paymentMethod = null;
        updateData.grossAmount = null;
      }

      if (transactionType === TransactionType.EXPENSE || transactionType === TransactionType.PURCHASE) {
        if (!shouldReplaceItems && updateTransactionDto.amount !== undefined) {
          throw new BadRequestException('EXPENSE/PURCHASE işleminde tutar kalemlerden hesaplanır');
        }

        if (recalculatedAmount !== undefined) {
          updateData.amount = recalculatedAmount;
        }

        updateData.paymentMethod = null;
        updateData.grossAmount = null;
      }

      if (transactionType === TransactionType.PAYMENT) {
        const currentMethod = existingTransaction.paymentMethod;
        const nextMethod = updateTransactionDto.paymentMethod ?? currentMethod;

        if (!nextMethod) {
          throw new BadRequestException('PAYMENT işleminde ödeme yöntemi zorunludur');
        }

        const currentGross = existingTransaction.grossAmount ? Number(existingTransaction.grossAmount) : Number(existingTransaction.amount);
        const nextGross = updateTransactionDto.amount !== undefined
          ? updateTransactionDto.amount
          : currentGross;

        if (nextGross <= 0) {
          throw new BadRequestException('PAYMENT işleminde tutar 0’dan büyük olmalıdır');
        }

        const roundedGross = this.roundMoney(nextGross);
        updateData.grossAmount = roundedGross;
        updateData.paymentMethod = nextMethod;
        updateData.amount = this.calculateEffectivePayment(roundedGross, nextMethod);
      }

      await tx.customerTransaction.update({
        where: { id },
        data: updateData,
      });

      const updatedTransaction = await tx.customerTransaction.findUnique({
        where: { id },
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

      if (!updatedTransaction) {
        throw new NotFoundException('Güncellenen işlem bulunamadı');
      }

      return new TransactionResponseDto(updatedTransaction);
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const transaction = await this.prisma.customerTransaction.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('İşlem bulunamadı');
    }

    await this.prisma.$transaction(async (tx) => {
      await this.rollbackItems(tx, id, transaction.type, transaction.items);

      await tx.customerTransaction.delete({
        where: { id },
      });
    });

    return { message: 'İşlem başarıyla silindi' };
  }

  private validateCreatePayload(dto: CreateTransactionDto): void {
    this.validatePartyCombination(dto.type, dto.customerId, dto.supplierId);
    this.validateItems(dto.type, dto.items);

    if (dto.type === TransactionType.INCOME && (dto.amount === undefined || dto.amount <= 0)) {
      throw new BadRequestException('INCOME işleminde tutar zorunludur ve 0’dan büyük olmalıdır');
    }

    if (dto.type === TransactionType.PAYMENT) {
      if (dto.amount === undefined || dto.amount <= 0) {
        throw new BadRequestException('PAYMENT işleminde tutar zorunludur ve 0’dan büyük olmalıdır');
      }
      if (!dto.paymentMethod) {
        throw new BadRequestException('PAYMENT işleminde ödeme yöntemi zorunludur');
      }
    }

    if (dto.type !== TransactionType.PAYMENT && dto.paymentMethod) {
      throw new BadRequestException('Sadece PAYMENT işleminde paymentMethod gönderilebilir');
    }
  }

  private validateUpdatePayload(
    type: TransactionType,
    dto: UpdateTransactionDto,
    existing: { paymentMethod: PaymentMethod | null; grossAmount: any; amount: any },
  ): void {
    if (dto.paymentMethod && type !== TransactionType.PAYMENT) {
      throw new BadRequestException('Sadece PAYMENT işleminde paymentMethod güncellenebilir');
    }

    if (dto.items !== undefined) {
      this.validateItems(type, dto.items);
    }

    if (type === TransactionType.PAYMENT) {
      if (dto.items && dto.items.length > 0) {
        throw new BadRequestException('PAYMENT işleminde ürün kalemi gönderilemez');
      }

      const nextMethod = dto.paymentMethod ?? existing.paymentMethod;
      if (!nextMethod) {
        throw new BadRequestException('PAYMENT işleminde ödeme yöntemi zorunludur');
      }

      if (dto.amount !== undefined && dto.amount <= 0) {
        throw new BadRequestException('PAYMENT işleminde tutar 0’dan büyük olmalıdır');
      }
    }

    if (type === TransactionType.INCOME && dto.amount !== undefined && dto.amount <= 0) {
      throw new BadRequestException('INCOME işleminde tutar 0’dan büyük olmalıdır');
    }
  }

  private validatePartyCombination(
    type: TransactionType,
    customerId?: string | null,
    supplierId?: string | null,
  ): void {
    if (customerId && supplierId) {
      throw new BadRequestException('Müşteri ve tedarikçi aynı anda gönderilemez');
    }

    if (this.requiresSupplier(type)) {
      if (!supplierId) {
        throw new BadRequestException(`${type} için tedarikçi seçilmelidir`);
      }
      if (customerId) {
        throw new BadRequestException(`${type} işleminde müşteri gönderilemez`);
      }
      return;
    }

    if (!customerId) {
      throw new BadRequestException('INCOME/EXPENSE için müşteri seçilmelidir');
    }

    if (supplierId) {
      throw new BadRequestException('INCOME/EXPENSE işleminde tedarikçi gönderilemez');
    }
  }

  private validateItems(type: TransactionType, items?: { productId: string; quantity: number }[]): void {
    if (type === TransactionType.EXPENSE || type === TransactionType.PURCHASE) {
      if (!items || items.length === 0) {
        throw new BadRequestException('EXPENSE/PURCHASE işlemleri için en az 1 ürün kalemi zorunludur');
      }
      return;
    }

    if (items && items.length > 0) {
      throw new BadRequestException(`${type} işleminde ürün kalemi gönderilemez`);
    }
  }

  private async assertRelatedEntityExists(
    tx: Prisma.TransactionClient,
    type: TransactionType,
    customerId?: string | null,
    supplierId?: string | null,
  ): Promise<void> {
    if (this.requiresSupplier(type) && supplierId) {
      const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
      if (!supplier) {
        throw new NotFoundException('Tedarikçi bulunamadı');
      }
      return;
    }

    if (this.requiresCustomer(type) && customerId) {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        throw new NotFoundException('Müşteri bulunamadı');
      }
    }
  }

  private aggregateItems(items: { productId: string; quantity: number }[]): AggregatedItem[] {
    const quantityByProduct = new Map<string, number>();

    for (const item of items) {
      const current = quantityByProduct.get(item.productId) || 0;
      quantityByProduct.set(item.productId, current + item.quantity);
    }

    return Array.from(quantityByProduct.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }

  private async prepareAndApplyItems(
    tx: Prisma.TransactionClient,
    params: {
      type: TransactionType;
      items: { productId: string; quantity: number }[];
    },
  ): Promise<{ items: ProcessedItem[]; totalAmount: number }> {
    const { type } = params;
    const aggregatedItems = this.aggregateItems(params.items);

    const productIds = aggregatedItems.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Bir veya daha fazla ürün bulunamadı');
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const processedItems: ProcessedItem[] = [];

    for (const item of aggregatedItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Ürün bulunamadı: ${item.productId}`);
      }

      if (type === TransactionType.EXPENSE && product.stock < item.quantity) {
        throw new BadRequestException(
          `Yetersiz stok: ${product.name}. Mevcut: ${product.stock}, İstenen: ${item.quantity}`,
        );
      }

      const unitPrice =
        type === TransactionType.PURCHASE ? Number(product.purchasePrice) : Number(product.salePrice);
      const subtotal = this.roundMoney(unitPrice * item.quantity);

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    for (const item of processedItems) {
      if (type === TransactionType.EXPENSE) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      } else if (type === TransactionType.PURCHASE) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const totalAmount = this.roundMoney(processedItems.reduce((sum, item) => sum + item.subtotal, 0));

    return { items: processedItems, totalAmount };
  }

  private async rollbackItems(
    tx: Prisma.TransactionClient,
    transactionId: string,
    type: TransactionType,
    items: { productId: string; quantity: number }[],
  ): Promise<void> {
    if (!items || items.length === 0) {
      return;
    }

    if (type === TransactionType.EXPENSE) {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    if (type === TransactionType.PURCHASE) {
      for (const item of items) {
        const currentProduct = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, stock: true },
        });

        if (!currentProduct) {
          throw new NotFoundException(`Ürün bulunamadı: ${item.productId}`);
        }

        if (currentProduct.stock < item.quantity) {
          throw new BadRequestException(
            `Stok negatif olacağı için işlem tamamlanamadı. Ürün: ${currentProduct.name}, ` +
              `Mevcut stok: ${currentProduct.stock}, Geri alınacak: ${item.quantity}`,
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    await tx.transactionItem.deleteMany({
      where: { transactionId },
    });
  }

  private calculateEffectivePayment(amount: number, method: PaymentMethod): number {
    const gross = this.roundMoney(amount);
    if (method === PaymentMethod.CARD) {
      return this.roundMoney(gross * 0.97);
    }
    return gross;
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private requiresSupplier(type: TransactionType): boolean {
    return type === TransactionType.PURCHASE || type === TransactionType.PAYMENT;
  }

  private requiresCustomer(type: TransactionType): boolean {
    return type === TransactionType.INCOME || type === TransactionType.EXPENSE;
  }

  private normalizeOptionalString(value?: string): string | null {
    if (value === undefined) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
}
