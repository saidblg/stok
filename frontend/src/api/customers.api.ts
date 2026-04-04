import apiClient from './client';
import {
  Customer,
  CustomerDetail,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerQueryParams,
  PaginatedResponse,
} from '../types';

type CustomerListResponse = {
  data: Customer[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const normalizePaginatedResponse = (
  payload: CustomerListResponse,
): PaginatedResponse<Customer> => {
  if (payload.meta) {
    return {
      data: payload.data,
      total: payload.meta.total,
      page: payload.meta.page,
      limit: payload.meta.limit,
      totalPages: payload.meta.totalPages,
    };
  }

  return payload as unknown as PaginatedResponse<Customer>;
};

export const customersApi = {
  getCustomers: async (params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> => {
    const response = await apiClient.get<{ success: boolean; data: CustomerListResponse }>('/customers', {
      params,
    });
    return normalizePaginatedResponse(response.data.data);
  },

  getCustomer: async (id: string): Promise<CustomerDetail> => {
    const response = await apiClient.get<{ success: boolean; data: CustomerDetail }>(`/customers/${id}`);
    return response.data.data;
  },

  createCustomer: async (data: CreateCustomerData): Promise<Customer> => {
    const response = await apiClient.post<{ success: boolean; data: Customer }>('/customers', data);
    return response.data.data;
  },

  updateCustomer: async (id: string, data: UpdateCustomerData): Promise<Customer> => {
    const response = await apiClient.patch<{ success: boolean; data: Customer }>(`/customers/${id}`, data);
    return response.data.data;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};
