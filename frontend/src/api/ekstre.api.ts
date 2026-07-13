import apiClient from './client';
import { EkstreParams, EkstreResponse } from '../types';

export const ekstreApi = {
  getPreview: async (params: EkstreParams): Promise<EkstreResponse> => {
    const response = await apiClient.get<{ success: boolean; data: EkstreResponse }>(
      '/ekstre/preview',
      { params }
    );
    return response.data.data;
  },

  downloadExcel: async (params: EkstreParams): Promise<Blob> => {
    const response = await apiClient.get('/ekstre/download', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
