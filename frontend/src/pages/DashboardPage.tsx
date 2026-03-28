import {
  useDashboardSummary,
  useRecentTransactions,
  useLowStockProducts,
  useDashboardCardOrder,
  useUpdateDashboardCardOrder,
} from '../hooks/useDashboard';
import { DashboardCardKey, DashboardPeriod } from '../types';
import { formatCurrency } from '../utils/format';
import SummaryCard from '../components/dashboard/SummaryCard';
import RecentActivities from '../components/dashboard/RecentActivities';
import LowStockAlert from '../components/dashboard/LowStockAlert';
import Loading from '../components/ui/Loading';
import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  GripVertical,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Package,
  AlertTriangle,
  Truck,
  ShoppingCart,
  CreditCard,
  Pencil,
  Eye,
  EyeOff,
} from 'lucide-react';

const DEFAULT_CARD_ORDER: DashboardCardKey[] = [
  'totalBalance',
  'totalExpense',
  'totalIncome',
  'totalPurchases',
  'supplierDebt',
  'totalCustomers',
  'totalSuppliers',
  'totalProducts',
  'lowStockCount',
];

const isValidCardOrder = (value: unknown): value is DashboardCardKey[] => {
  if (!Array.isArray(value) || value.length !== DEFAULT_CARD_ORDER.length) {
    return false;
  }

  return DEFAULT_CARD_ORDER.every((key) => value.includes(key));
};

const DashboardPage = () => {
  const [period, setPeriod] = useState<DashboardPeriod>('1m');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMasked, setIsMasked] = useState(false);
  const [draggedCard, setDraggedCard] = useState<DashboardCardKey | null>(null);
  const [cardOrder, setCardOrder] = useState<DashboardCardKey[]>(DEFAULT_CARD_ORDER);
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(period);
  const lowStockLimit = summary?.lowStockCount && summary.lowStockCount > 0 ? summary.lowStockCount : undefined;
  const { data: recentTransactions = [], isLoading: transactionsLoading } =
    useRecentTransactions(5);
  const { data: lowStockProducts = [], isLoading: lowStockLoading } =
    useLowStockProducts(lowStockLimit);
  const { data: dashboardCardOrderData, isLoading: cardOrderLoading } = useDashboardCardOrder();
  const updateDashboardCardOrder = useUpdateDashboardCardOrder();

  useEffect(() => {
    if (!dashboardCardOrderData?.dashboardCardOrder) {
      return;
    }

    const order = dashboardCardOrderData.dashboardCardOrder;
    setCardOrder(isValidCardOrder(order) ? order : DEFAULT_CARD_ORDER);
  }, [dashboardCardOrderData]);

  const displayValue = (value: string | number): string | number => {
    return isMasked ? '******' : value;
  };

  const cardsByKey = useMemo(
    () => ({
      totalBalance: (
        <SummaryCard
          title="Toplam Alacak"
          value={displayValue(formatCurrency(summary?.totalBalance || 0))}
          subtitle="Satış - Tahsilat"
          icon={Wallet}
          iconColor={
            (summary?.totalBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }
          bgColor={(summary?.totalBalance || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}
        />
      ),
      totalExpense: (
        <SummaryCard
          title="Toplam Satış"
          value={displayValue(formatCurrency(summary?.totalExpense || 0))}
          subtitle="Müşteri borçları"
          icon={TrendingUp}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
      ),
      totalIncome: (
        <SummaryCard
          title="Toplam Tahsilat"
          value={displayValue(formatCurrency(summary?.totalIncome || 0))}
          subtitle="Ödenen tutarlar"
          icon={TrendingDown}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
        />
      ),
      totalPurchases: (
        <SummaryCard
          title="Toplam Alım"
          value={displayValue(formatCurrency(summary?.totalPurchases || 0))}
          subtitle="Tedarikçi alışları"
          icon={ShoppingCart}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
        />
      ),
      supplierDebt: (
        <SummaryCard
          title="Tedarikçi Borcu"
          value={displayValue(formatCurrency(summary?.supplierDebt || 0))}
          subtitle="Ödenmesi gereken"
          icon={CreditCard}
          iconColor="text-red-600"
          bgColor="bg-red-100"
        />
      ),
      totalCustomers: (
        <SummaryCard
          title="Toplam Müşteri"
          value={displayValue(summary?.totalCustomers || 0)}
          subtitle="Kayıtlı müşteri sayısı"
          icon={Users}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-100"
        />
      ),
      totalSuppliers: (
        <SummaryCard
          title="Toplam Tedarikçi"
          value={displayValue(summary?.totalSuppliers || 0)}
          subtitle="Kayıtlı tedarikçi sayısı"
          icon={Truck}
          iconColor="text-teal-600"
          bgColor="bg-teal-100"
        />
      ),
      totalProducts: (
        <SummaryCard
          title="Toplam Ürün"
          value={displayValue(summary?.totalProducts || 0)}
          subtitle="Kayıtlı ürün sayısı"
          icon={Package}
          iconColor="text-cyan-600"
          bgColor="bg-cyan-100"
        />
      ),
      lowStockCount: (
        <SummaryCard
          title="Düşük Stok"
          value={displayValue(summary?.lowStockCount || 0)}
          subtitle="Stoğu azalan ürünler"
          icon={AlertTriangle}
          iconColor="text-yellow-600"
          bgColor="bg-yellow-100"
        />
      ),
    }),
    [summary, isMasked],
  );

  const moveCard = (source: DashboardCardKey, target: DashboardCardKey) => {
    if (source === target) {
      return;
    }

    setCardOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(source);
      const toIndex = next.indexOf(target);

      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }

      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, source);
      return next;
    });
  };

  if (summaryLoading || transactionsLoading || lowStockLoading || cardOrderLoading) {
    return <Loading fullScreen />;
  }

  const toggleEditMode = () => {
    if (isEditMode) {
      updateDashboardCardOrder.mutate(cardOrder);
    }
    setIsEditMode((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ana Sayfa</h1>
          <p className="text-gray-600 mt-1">Genel istatistikler ve son işlemler</p>
        </div>

        <div className="flex w-full items-end gap-2 md:w-auto">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarih Filtresi</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1m">Son 1 Ay</option>
              <option value="3m">Son 3 Ay</option>
              <option value="6m">Son 6 Ay</option>
              <option value="all">Tüm Zamanlar</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setIsMasked((prev) => !prev)}
            className={`inline-flex h-[42px] w-[42px] items-center justify-center rounded-lg border transition-colors ${
              isMasked
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title={isMasked ? 'Bakiyeleri Göster' : 'Bakiyeleri Gizle'}
          >
            {isMasked ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            type="button"
            onClick={toggleEditMode}
            className={`inline-flex min-w-20 flex-col items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              isEditMode
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{isEditMode ? 'Tamam' : 'Düzenle'}</span>
            {isEditMode ? <Check size={16} className="mt-1" /> : <Pencil size={16} className="mt-1" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardOrder.map((cardKey) => (
          <div
            key={cardKey}
            draggable={isEditMode}
            onDragStart={() => setDraggedCard(cardKey)}
            onDragOver={(e) => {
              if (!isEditMode) return;
              e.preventDefault();
            }}
            onDrop={() => {
              if (!isEditMode || !draggedCard) return;
              moveCard(draggedCard, cardKey);
              setDraggedCard(null);
            }}
            onDragEnd={() => setDraggedCard(null)}
            className={isEditMode ? 'cursor-move rounded-lg ring-2 ring-dashed ring-blue-200' : ''}
          >
            {isEditMode && (
              <div className="mb-2 flex items-center gap-1 text-xs font-medium text-blue-700">
                <GripVertical size={14} />
                Kartı sürükleyip bırak
              </div>
            )}
            {cardsByKey[cardKey]}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivities transactions={recentTransactions} />
        <LowStockAlert products={lowStockProducts} />
      </div>
    </div>
  );
};

export default DashboardPage;
