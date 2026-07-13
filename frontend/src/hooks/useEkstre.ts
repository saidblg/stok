import { useQuery, useMutation } from '@tanstack/react-query';
import { ekstreApi } from '../api/ekstre.api';
import { EkstreParams, EntityType } from '../types';
import toast from 'react-hot-toast';

export const useEkstrePreview = (
  params: EkstreParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['ekstre-preview', params],
    queryFn: () => ekstreApi.getPreview(params),
    enabled: options?.enabled ?? false,
  });
};

export const useEkstreDownload = () => {
  return useMutation({
    mutationFn: (params: EkstreParams) => ekstreApi.downloadExcel(params),
    onSuccess: (blob, params) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const typeLabel = params.entityType === EntityType.SUPPLIER ? 'tedarikci' : 'musteri';
      link.download = `ekstre_${typeLabel}_${params.entityId}_${params.startDate}_${params.endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Ekstre başarıyla indirildi');
    },
    onError: () => {
      toast.error('Ekstre indirilirken hata oluştu');
    },
  });
};
