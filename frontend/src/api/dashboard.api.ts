import apiClient from './client';
import {
  DashboardSummary,
  DashboardPeriod,
  Transaction,
  Product,
  DashboardCardOrderResponse,
  DashboardCardKey,
  ThemePreference,
  ThemePreferenceResponse,
} from '../types';

export const dashboardApi = {
  getSummary: async (period: DashboardPeriod = '1m'): Promise<DashboardSummary> => {
    const response = await apiClient.get<{ success: boolean; data: DashboardSummary }>('/dashboard/summary', {
      params: { period },
    });
    return response.data.data;
  },

  getRecentTransactions: async (limit = 10): Promise<Transaction[]> => {
    const response = await apiClient.get<{ success: boolean; data: Transaction[] }>('/dashboard/recent-transactions', {
      params: { limit },
    });
    return response.data.data;
  },

  getLowStockProducts: async (limit?: number): Promise<Product[]> => {
    const response = await apiClient.get<{ success: boolean; data: Product[] }>('/dashboard/low-stock-products', {
      params: limit ? { limit } : undefined,
    });
    return response.data.data;
  },

  getDashboardCardOrder: async (): Promise<DashboardCardOrderResponse> => {
    const response = await apiClient.get<{ success: boolean; data: DashboardCardOrderResponse }>(
      '/users/me/dashboard-card-order',
    );
    return response.data.data;
  },

  updateDashboardCardOrder: async (dashboardCardOrder: DashboardCardKey[]): Promise<DashboardCardOrderResponse> => {
    const response = await apiClient.post<{ success: boolean; data: DashboardCardOrderResponse }>(
      '/users/me/dashboard-card-order',
      { dashboardCardOrder },
    );
    return response.data.data;
  },

  getThemePreference: async (): Promise<ThemePreferenceResponse> => {
    const response = await apiClient.get<{ success: boolean; data: ThemePreferenceResponse }>(
      '/users/me/theme-preference',
    );
    return response.data.data;
  },

  updateThemePreference: async (themePreference: ThemePreference): Promise<ThemePreferenceResponse> => {
    const response = await apiClient.post<{ success: boolean; data: ThemePreferenceResponse }>(
      '/users/me/theme-preference',
      { themePreference },
    );
    return response.data.data;
  },
};
