import apiClient from './client';
import {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionQueryParams,
  PaginatedResponse,
} from '../types';

type TransactionListResponse = {
  data: Transaction[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const normalizePaginatedResponse = (
  payload: TransactionListResponse,
): PaginatedResponse<Transaction> => {
  if (payload.meta) {
    return {
      data: payload.data,
      total: payload.meta.total,
      page: payload.meta.page,
      limit: payload.meta.limit,
      totalPages: payload.meta.totalPages,
    };
  }

  return payload as unknown as PaginatedResponse<Transaction>;
};

export const transactionsApi = {
  getTransactions: async (
    params?: TransactionQueryParams
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<{ success: boolean; data: TransactionListResponse }>('/transactions', {
      params,
    });
    return normalizePaginatedResponse(response.data.data);
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get<{ success: boolean; data: Transaction }>(`/transactions/${id}`);
    return response.data.data;
  },

  createTransaction: async (data: CreateTransactionData): Promise<Transaction> => {
    const response = await apiClient.post<{ success: boolean; data: Transaction }>('/transactions', data);
    return response.data.data;
  },

  updateTransaction: async (id: string, data: UpdateTransactionData): Promise<Transaction> => {
    const response = await apiClient.patch<{ success: boolean; data: Transaction }>(`/transactions/${id}`, data);
    return response.data.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`);
  },

  getCustomerTransactions: async (
    customerId: string,
    params?: TransactionQueryParams
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<{ success: boolean; data: TransactionListResponse }>(
      `/customers/${customerId}/transactions`,
      { params }
    );
    return normalizePaginatedResponse(response.data.data);
  },

  getSupplierTransactions: async (
    supplierId: string,
    params?: TransactionQueryParams
  ): Promise<PaginatedResponse<Transaction>> => {
    const response = await apiClient.get<{ success: boolean; data: TransactionListResponse }>(
      `/suppliers/${supplierId}/transactions`,
      { params }
    );
    return normalizePaginatedResponse(response.data.data);
  },
};
