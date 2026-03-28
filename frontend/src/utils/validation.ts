import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi gereklidir')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gereklidir'),
  purchasePrice: z
    .number({ invalid_type_error: 'Alış fiyatı sayı olmalıdır' })
    .min(0, 'Alış fiyatı 0 veya daha büyük olmalıdır'),
  salePrice: z
    .number({ invalid_type_error: 'Satış fiyatı sayı olmalıdır' })
    .min(0, 'Satış fiyatı 0 veya daha büyük olmalıdır'),
  stock: z
    .number({ invalid_type_error: 'Stok sayı olmalıdır' })
    .int('Stok tam sayı olmalıdır')
    .min(0, 'Stok 0 veya daha büyük olmalıdır'),
  lowStockThreshold: z
    .number({ invalid_type_error: 'Düşük stok eşiği sayı olmalıdır' })
    .int('Düşük stok eşiği tam sayı olmalıdır')
    .min(0, 'Düşük stok eşiği 0 veya daha büyük olmalıdır')
    .optional()
    .default(10),
});

export const customerSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Geçerli bir e-posta adresi giriniz').optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const transactionSchema = z.object({
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'PURCHASE', 'PAYMENT'], {
    required_error: 'İşlem tipi seçilmelidir',
  }),
  paymentMethod: z.enum(['CASH', 'CARD']).optional(),
  amount: z
    .number({ invalid_type_error: 'Tutar sayı olmalıdır' })
    .min(0.01, 'Tutar 0\'dan büyük olmalıdır'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
  })).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});

export const purchaseTransactionSchema = z.object({
  supplierId: z.string().min(1, 'Tedarikçi seçilmelidir'),
  type: z.literal('PURCHASE'),
  productId: z.string().min(1, 'Ürün seçilmelidir'),
  quantity: z
    .number({ invalid_type_error: 'Miktar sayı olmalıdır' })
    .int('Miktar tam sayı olmalıdır')
    .min(1, 'Miktar 1 veya daha büyük olmalıdır'),
  amount: z
    .number({ invalid_type_error: 'Tutar sayı olmalıdır' })
    .min(0.01, 'Tutar 0\'dan büyük olmalıdır'),
  description: z.string().min(1, 'Açıklama gereklidir'),
  date: z.string().optional(),
});
