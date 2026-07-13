import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EkstreQueryDto, EntityType } from './dto/ekstre-query.dto';
import { EkstreResponseDto, EkstreRowDto } from './dto/ekstre-response.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class EkstreService {
  constructor(private prisma: PrismaService) {}

  async generateStatement(query: EkstreQueryDto): Promise<EkstreResponseDto> {
    const { entityType = EntityType.CUSTOMER, entityId, startDate, endDate } = query;

    if (entityType === EntityType.SUPPLIER) {
      return this.generateSupplierStatement(entityId, startDate, endDate);
    }

    return this.generateCustomerStatement(entityId, startDate, endDate);
  }

  private async generateCustomerStatement(
    customerId: string,
    startDate: string,
    endDate: string,
  ): Promise<EkstreResponseDto> {
    // Müşteri kontrolü
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Müşteri bulunamadı');
    }

    // Devir bakiye hesaplama (startDate öncesi işlemler)
    const priorTransactions = await this.prisma.customerTransaction.findMany({
      where: {
        customerId,
        date: { lt: new Date(startDate) },
      },
      select: { type: true, amount: true },
    });

    let openingBalance = 0;
    for (const t of priorTransactions) {
      if (t.type === 'EXPENSE') {
        openingBalance += Number(t.amount); // Alacak (satış - müşteri borçlandı)
      } else if (t.type === 'INCOME') {
        openingBalance -= Number(t.amount); // Borç (tahsilat - müşteri ödedi)
      }
    }

    // Tarih aralığındaki işlemleri getir
    const transactions = await this.prisma.customerTransaction.findMany({
      where: {
        customerId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z'),
        },
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        date: true,
      },
    });

    // Satırları running balance ile oluştur
    const rows: EkstreRowDto[] = [];
    let runningBalance = openingBalance;

    for (const t of transactions) {
      const borc = t.type === 'INCOME' ? Number(t.amount) : 0;
      const alacak = t.type === 'EXPENSE' ? Number(t.amount) : 0;

      runningBalance = runningBalance + alacak - borc;

      rows.push({
        id: t.id,
        date: t.date,
        description: t.description || this.getCustomerDescription(t.type),
        borc,
        alacak,
        bakiye: runningBalance,
      });
    }

    return {
      entity: {
        id: customer.id,
        name: customer.name || 'İsimsiz Müşteri',
        type: EntityType.CUSTOMER,
      },
      startDate,
      endDate,
      openingBalance,
      closingBalance: runningBalance,
      rows,
    };
  }

  private async generateSupplierStatement(
    supplierId: string,
    startDate: string,
    endDate: string,
  ): Promise<EkstreResponseDto> {
    // Tedarikçi kontrolü
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Tedarikçi bulunamadı');
    }

    // Devir bakiye hesaplama (startDate öncesi işlemler)
    const priorTransactions = await this.prisma.customerTransaction.findMany({
      where: {
        supplierId,
        date: { lt: new Date(startDate) },
      },
      select: { type: true, amount: true },
    });

    let openingBalance = 0;
    for (const t of priorTransactions) {
      if (t.type === 'PURCHASE') {
        openingBalance += Number(t.amount); // Alacak (mal alımı - biz borçlandık)
      } else if (t.type === 'PAYMENT') {
        openingBalance -= Number(t.amount); // Borç (ödeme - biz ödedik)
      }
    }

    // Tarih aralığındaki işlemleri getir
    const transactions = await this.prisma.customerTransaction.findMany({
      where: {
        supplierId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z'),
        },
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        date: true,
      },
    });

    // Satırları running balance ile oluştur
    const rows: EkstreRowDto[] = [];
    let runningBalance = openingBalance;

    for (const t of transactions) {
      const borc = t.type === 'PAYMENT' ? Number(t.amount) : 0;
      const alacak = t.type === 'PURCHASE' ? Number(t.amount) : 0;

      runningBalance = runningBalance + alacak - borc;

      rows.push({
        id: t.id,
        date: t.date,
        description: t.description || this.getSupplierDescription(t.type),
        borc,
        alacak,
        bakiye: runningBalance,
      });
    }

    return {
      entity: {
        id: supplier.id,
        name: supplier.name || 'İsimsiz Tedarikçi',
        type: EntityType.SUPPLIER,
      },
      startDate,
      endDate,
      openingBalance,
      closingBalance: runningBalance,
      rows,
    };
  }

  async generateExcel(query: EkstreQueryDto): Promise<Buffer> {
    const statement = await this.generateStatement(query);
    const isSupplier = statement.entity.type === EntityType.SUPPLIER;
    const entityLabel = isSupplier ? 'TEDARİKÇİ' : 'MÜŞTERİ';

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Karabacak Gıda';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Ekstre');

    // Başlık bilgisi
    sheet.mergeCells('A1:F1');
    sheet.getCell('A1').value = `${entityLabel} HESAP EKSTRESİ - ${statement.entity.name}`;
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.mergeCells('A2:F2');
    sheet.getCell('A2').value = `Tarih Aralığı: ${this.formatDate(statement.startDate)} - ${this.formatDate(statement.endDate)}`;
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    // Devir bakiye satırı
    sheet.mergeCells('A3:E3');
    sheet.getCell('A3').value = 'Devir Bakiye';
    sheet.getCell('A3').font = { bold: true };
    sheet.getCell('F3').value = statement.openingBalance;
    sheet.getCell('F3').numFmt = '#,##0.00';

    // Sütun başlıkları
    const headerRow = sheet.addRow([
      'Hesap',
      'Tarih',
      'Açıklama',
      'Borç',
      'Alacak',
      'Bakiye',
    ]);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      cell.border = {
        bottom: { style: 'thin' },
      };
    });

    // Sütun genişlikleri
    sheet.getColumn(1).width = 25; // Hesap
    sheet.getColumn(2).width = 15; // Tarih
    sheet.getColumn(3).width = 30; // Açıklama
    sheet.getColumn(4).width = 15; // Borç
    sheet.getColumn(5).width = 15; // Alacak
    sheet.getColumn(6).width = 15; // Bakiye

    // Veri satırları
    for (const row of statement.rows) {
      const dataRow = sheet.addRow([
        statement.entity.name,
        this.formatDate(row.date),
        row.description,
        row.borc || '',
        row.alacak || '',
        row.bakiye,
      ]);

      // Sayı formatları
      dataRow.getCell(4).numFmt = '#,##0.00';
      dataRow.getCell(5).numFmt = '#,##0.00';
      dataRow.getCell(6).numFmt = '#,##0.00';
    }

    // Kapanış bakiye satırı
    const closingRow = sheet.addRow([
      '',
      '',
      'KAPANIŞ BAKİYE',
      '',
      '',
      statement.closingBalance,
    ]);
    closingRow.font = { bold: true };
    closingRow.getCell(6).numFmt = '#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private getCustomerDescription(type: string): string {
    switch (type) {
      case 'INCOME':
        return 'Tahsilat';
      case 'EXPENSE':
        return 'Satış';
      default:
        return 'İşlem';
    }
  }

  private getSupplierDescription(type: string): string {
    switch (type) {
      case 'PURCHASE':
        return 'Mal Alımı';
      case 'PAYMENT':
        return 'Ödeme';
      default:
        return 'İşlem';
    }
  }

  private formatDate(dateInput: Date | string): string {
    const date =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}
