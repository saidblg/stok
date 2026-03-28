import apiClient from './client';
import {
  Supplier,
  SupplierDetail,
  SupplierBalance,
  CreateSupplierData,
  UpdateSupplierData,
  SupplierQueryParams,
  PaginatedResponse,
} from '../types';

export const suppliersApi = {
  getSuppliers: async (params?: SupplierQueryParams): Promise<PaginatedResponse<Supplier>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Supplier> }>('/suppliers', { params });
    return response.data.data;
  },

  getSupplier: async (id: string): Promise<SupplierDetail> => {
    const response = await apiClient.get<{ success: boolean; data: SupplierDetail }>(`/suppliers/${id}`);
    return response.data.data;
  },

  createSupplier: async (data: CreateSupplierData): Promise<Supplier> => {
    const response = await apiClient.post<{ success: boolean; data: Supplier }>('/suppliers', data);
    return response.data.data;
  },

  updateSupplier: async (id: string, data: UpdateSupplierData): Promise<Supplier> => {
    const response = await apiClient.patch<{ success: boolean; data: Supplier }>(`/suppliers/${id}`, data);
    return response.data.data;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },

  getSupplierBalance: async (id: string): Promise<SupplierBalance> => {
    const response = await apiClient.get<{ success: boolean; data: SupplierBalance }>(`/suppliers/${id}/balance`);
    return response.data.data;
  },
};
