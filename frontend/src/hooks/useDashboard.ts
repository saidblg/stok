import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { DashboardCardKey, DashboardPeriod } from '../types';

export const useDashboardSummary = (period: DashboardPeriod = '1m') => {
  return useQuery({
    queryKey: ['dashboard-summary', period],
    queryFn: () => dashboardApi.getSummary(period),
  });
};

export const useRecentTransactions = (limit = 10) => {
  return useQuery({
    queryKey: ['recent-transactions', limit],
    queryFn: () => dashboardApi.getRecentTransactions(limit),
  });
};

export const useLowStockProducts = (limit?: number) => {
  return useQuery({
    queryKey: ['low-stock-products', limit],
    queryFn: () => dashboardApi.getLowStockProducts(limit),
  });
};

export const useDashboardCardOrder = () => {
  return useQuery({
    queryKey: ['dashboard-card-order'],
    queryFn: () => dashboardApi.getDashboardCardOrder(),
  });
};

export const useUpdateDashboardCardOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dashboardCardOrder: DashboardCardKey[]) =>
      dashboardApi.updateDashboardCardOrder(dashboardCardOrder),
    onSuccess: (data) => {
      queryClient.setQueryData(['dashboard-card-order'], data);
    },
  });
};
