import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { invoicesApi } from '../api/invoices.api';
import { CreateInvoiceData, InvoiceQueryParams, UpdateInvoiceData } from '../types';

export const useInvoices = (params?: InvoiceQueryParams) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.getInvoices(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getInvoice(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoiceData) => invoicesApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura başarıyla oluşturuldu');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Fatura oluşturulurken hata oluştu';
      toast.error(message);
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceData }) => invoicesApi.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
      toast.success('Fatura güncellendi');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Fatura güncellenirken hata oluştu';
      toast.error(message);
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Fatura silindi');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Fatura silinirken hata oluştu';
      toast.error(message);
    },
  });
};
