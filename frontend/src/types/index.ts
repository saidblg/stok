export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export type ThemePreference = 'light' | 'dark';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  PURCHASE = 'PURCHASE',
  PAYMENT = 'PAYMENT',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
}

export enum InvoiceType {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

export enum VatRate {
  VAT_1 = 'VAT_1',
  VAT_10 = 'VAT_10',
}

export enum ProductType {
  KOLI = 'KOLI',
  ADET = 'ADET',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  themePreference: ThemePreference;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  image: string | null;
  productType: ProductType;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  lowStockThreshold: number;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  customerId: string | null;
  customer?: Customer;
  supplierId: string | null;
  supplier?: Supplier;
  productId: string | null;
  product?: Product | null;
  type: TransactionType;
  paymentMethod?: PaymentMethod | null;
  grossAmount?: number | null;
  amount: number;
  quantity: number | null;
  items: TransactionItem[];
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerBalance {
  totalExpense: number;
  totalIncome: number;
  balance: number;
}

export interface CustomerDetail extends Customer {
  balance: CustomerBalance;
  recentTransactions?: Transaction[];
}

export interface SupplierBalance {
  totalPurchases: number;
  totalPayments: number;
  balance: number;
}

export interface SupplierDetail extends Supplier {
  balance: SupplierBalance;
  totalTransactions: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalPurchases: number;
  totalSuppliers: number;
  supplierDebt: number;
}

export type DashboardPeriod = '1m' | '3m' | '6m' | 'all';

export type DashboardCardKey =
  | 'totalBalance'
  | 'totalExpense'
  | 'totalIncome'
  | 'totalPurchases'
  | 'supplierDebt'
  | 'totalCustomers'
  | 'totalSuppliers'
  | 'totalProducts'
  | 'lowStockCount';

export interface DashboardCardOrderResponse {
  dashboardCardOrder: DashboardCardKey[];
}

export interface ThemePreferenceResponse {
  themePreference: ThemePreference;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  amount: number;
  vatRate: VatRate;
  note: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductQueryParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerQueryParams extends PaginationParams {
  search?: string;
}

export interface TransactionQueryParams extends PaginationParams {
  customerId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface CreateProductData {
  name: string;
  productType?: ProductType;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  lowStockThreshold?: number;
}

export interface UpdateProductData {
  name?: string;
  productType?: ProductType;
  purchasePrice?: number;
  salePrice?: number;
  stock?: number;
  lowStockThreshold?: number;
}

export interface CreateCustomerData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface CreateSupplierData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateSupplierData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface SupplierQueryParams extends PaginationParams {
  search?: string;
}

export interface CreateTransactionItemData {
  productId: string;
  quantity: number;
}

export interface CreateTransactionData {
  customerId?: string;
  supplierId?: string;
  type: TransactionType;
  paymentMethod?: PaymentMethod;
  amount?: number;
  items?: CreateTransactionItemData[];
  description?: string;
  date?: string;
}

export interface UpdateTransactionData {
  customerId?: string;
  supplierId?: string;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  amount?: number;
  items?: CreateTransactionItemData[];
  description?: string;
  date?: string;
}

export interface InvoiceQueryParams extends PaginationParams {}

export interface CreateInvoiceData {
  type: InvoiceType;
  amount: number;
  vatRate: VatRate;
  note?: string;
  date: string;
}

export interface UpdateInvoiceData {
  type?: InvoiceType;
  amount?: number;
  vatRate?: VatRate;
  note?: string;
  date?: string;
}
