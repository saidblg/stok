import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import {
  CreateProductData,
  UpdateProductData,
  ProductQueryParams,
} from '../types';
import toast from 'react-hot-toast';

export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    placeholderData: keepPreviousData,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductData) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
      toast.success('Ürün başarıyla eklendi');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ürün eklenirken hata oluştu';
      toast.error(message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) =>
      productsApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
      toast.success('Ürün başarıyla güncellendi');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ürün güncellenirken hata oluştu';
      toast.error(message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });
      toast.success('Ürün başarıyla silindi');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ürün silinirken hata oluştu';
      toast.error(message);
    },
  });
};

export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      productsApi.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success('Ürün görseli başarıyla yüklendi');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Görsel yüklenirken hata oluştu';
      toast.error(message);
    },
  });
};
