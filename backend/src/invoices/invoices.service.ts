import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.create({
      data: {
        ...createInvoiceDto,
        note: this.normalizeOptionalString(createInvoiceDto.note),
        date: new Date(createInvoiceDto.date),
      },
    });

    return new InvoiceResponseDto(invoice);
  }

  async findAll(query: InvoiceQueryDto) {
    const { page = 1, limit = 10 } = query;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count(),
    ]);

    return {
      data: invoices.map((invoice) => new InvoiceResponseDto(invoice)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });

    if (!invoice) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    return new InvoiceResponseDto(invoice);
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    await this.findOne(id);

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...updateInvoiceDto,
        note: updateInvoiceDto.note !== undefined ? this.normalizeOptionalString(updateInvoiceDto.note) : undefined,
        date: updateInvoiceDto.date ? new Date(updateInvoiceDto.date) : undefined,
      },
    });

    return new InvoiceResponseDto(invoice);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.invoice.delete({ where: { id } });

    return { message: 'Fatura başarıyla silindi' };
  }

  private normalizeOptionalString(value?: string): string | null {
    if (value === undefined) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
}
