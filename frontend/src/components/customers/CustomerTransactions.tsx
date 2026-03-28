import { useState } from 'react';
import { TransactionType } from '../../types';
import { useCustomerTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import TransactionList from '../transactions/TransactionList';
import Loading from '../ui/Loading';

interface CustomerTransactionsProps {
  customerId: string;
}

const CustomerTransactions = ({ customerId }: CustomerTransactionsProps) => {
  const [filter, setFilter] = useState<TransactionType | 'ALL'>('ALL');
  const { data, isLoading } = useCustomerTransactions(customerId, {
    type: filter === 'ALL' ? undefined : filter,
  });
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu işlemi silmek istediğinizden emin misiniz?')) {
      await deleteTransaction.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">İşlem Geçmişi</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'ALL'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter(TransactionType.EXPENSE)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === TransactionType.EXPENSE
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Satışlar
          </button>
          <button
            onClick={() => setFilter(TransactionType.INCOME)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === TransactionType.INCOME
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tahsilatlar
          </button>
        </div>
      </div>

      <TransactionList transactions={data?.data || []} onDelete={handleDelete} />
    </div>
  );
};

export default CustomerTransactions;
