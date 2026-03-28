import { useState } from 'react';
import { TransactionType } from '../../types';
import { useSupplierTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import TransactionList from '../transactions/TransactionList';
import Loading from '../ui/Loading';

interface SupplierTransactionsProps {
  supplierId: string;
}

const SupplierTransactions = ({ supplierId }: SupplierTransactionsProps) => {
  const [filter, setFilter] = useState<TransactionType | 'ALL'>('ALL');
  const { data, isLoading } = useSupplierTransactions(supplierId, {
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
            onClick={() => setFilter(TransactionType.PURCHASE)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === TransactionType.PURCHASE
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Mal Alışları
          </button>
          <button
            onClick={() => setFilter(TransactionType.PAYMENT)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === TransactionType.PAYMENT
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Ödemeler
          </button>
        </div>
      </div>

      <TransactionList transactions={data?.data || []} onDelete={handleDelete} />
    </div>
  );
};

export default SupplierTransactions;
