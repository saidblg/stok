import apiClient from './client';
import {
  Customer,
  CustomerDetail,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerQueryParams,
  PaginatedResponse,
} from '../types';

export const customersApi = {
  getCustomers: async (params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Customer> }>('/customers', { params });
    return response.data.data;
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
