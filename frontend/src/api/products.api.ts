import apiClient from './client';
import {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductQueryParams,
  PaginatedResponse,
} from '../types';

export const productsApi = {
  getProducts: async (params?: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Product> }>('/products', { params });
    return response.data.data;
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
