import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliers.api';
import { CreateSupplierData, UpdateSupplierData, SupplierQueryParams } from '../types';
import toast from 'react-hot-toast';

export const useSuppliers = (params?: SupplierQueryParams) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => suppliersApi.getSuppliers(params),
    placeholderData: keepPreviousData,
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => suppliersApi.getSupplier(id),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierData) => suppliersApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Tedarikçi başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Tedarikçi oluşturulurken hata oluştu';
      toast.error(message);
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierData }) =>
      suppliersApi.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
      toast.success('Tedarikçi başarıyla güncellendi');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Tedarikçi güncellenirken hata oluştu';
      toast.error(message);
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      toast.success('Tedarikçi başarıyla silindi');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Tedarikçi silinirken hata oluştu';
      toast.error(message);
    },
  });
};

export const useSupplierBalance = (id: string) => {
  return useQuery({
    queryKey: ['supplier-balance', id],
    queryFn: () => suppliersApi.getSupplierBalance(id),
    enabled: !!id,
  });
};
