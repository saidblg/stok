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

type SupplierListResponse = {
  data: Supplier[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const normalizePaginatedResponse = (
  payload: SupplierListResponse,
): PaginatedResponse<Supplier> => {
  if (payload.meta) {
    return {
      data: payload.data,
      total: payload.meta.total,
      page: payload.meta.page,
      limit: payload.meta.limit,
      totalPages: payload.meta.totalPages,
    };
  }

  return payload as unknown as PaginatedResponse<Supplier>;
};

export const suppliersApi = {
  getSuppliers: async (params?: SupplierQueryParams): Promise<PaginatedResponse<Supplier>> => {
    const response = await apiClient.get<{ success: boolean; data: SupplierListResponse }>('/suppliers', {
      params,
    });
    return normalizePaginatedResponse(response.data.data);
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
