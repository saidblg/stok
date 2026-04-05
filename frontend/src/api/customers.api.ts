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
  return {
    data: payload.data || [],
    total: payload.meta?.total || 0,
    page: payload.meta?.page || 1,
    limit: payload.meta?.limit || 10,
    totalPages: payload.meta?.totalPages || 1,
  };
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
