import apiClient from './client';
import {
  CreateInvoiceData,
  Invoice,
  InvoiceQueryParams,
  PaginatedResponse,
  UpdateInvoiceData,
} from '../types';

export const invoicesApi = {
  getInvoices: async (params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Invoice> }>('/invoices', {
      params,
    });
    return response.data.data;
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<{ success: boolean; data: Invoice }>(`/invoices/${id}`);
    return response.data.data;
  },

  createInvoice: async (data: CreateInvoiceData): Promise<Invoice> => {
    const response = await apiClient.post<{ success: boolean; data: Invoice }>('/invoices', data);
    return response.data.data;
  },

  updateInvoice: async (id: string, data: UpdateInvoiceData): Promise<Invoice> => {
    const response = await apiClient.patch<{ success: boolean; data: Invoice }>(`/invoices/${id}`, data);
    return response.data.data;
  },

  deleteInvoice: async (id: string): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  },
};
