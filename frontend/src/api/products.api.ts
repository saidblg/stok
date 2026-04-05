import apiClient from './client';
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductQueryParams,
  PaginatedResponse,
} from '../types';

type ProductListResponse = {
  data: Product[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const normalizePaginatedResponse = (
  payload: ProductListResponse,
): PaginatedResponse<Product> => {
  return {
    data: payload.data || [],
    total: payload.meta?.total || 0,
    page: payload.meta?.page || 1,
    limit: payload.meta?.limit || 10,
    totalPages: payload.meta?.totalPages || 1,
  };
};

export const productsApi = {
  getProducts: async (params?: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<{ success: boolean; data: ProductListResponse }>('/products', { params });
    return normalizePaginatedResponse(response.data.data);
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await apiClient.post<{ success: boolean; data: Product }>('/products', data);
    return response.data.data;
  },

  updateProduct: async (id: string, data: UpdateProductData): Promise<Product> => {
    const response = await apiClient.patch<{ success: boolean; data: Product }>(`/products/${id}`, data);
    return response.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  uploadImage: async (id: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
      `/products/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },
};
