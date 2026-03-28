import { Transaction, TransactionType } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentActivitiesProps {
  transactions: Transaction[];
}

const RecentActivities = ({ transactions }: RecentActivitiesProps) => {
  if (transactions.length === 0) {
    return (
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Son İşlemler</h3>
          <Link to="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Tümünü Gör
          </Link>
        </div>
        <p className="text-gray-500 text-center py-8">Henüz işlem bulunmuyor</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Son İşlemler</h3>
        <Link to="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-700">
          Tümünü Gör
        </Link>
      </div>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === TransactionType.INCOME || transaction.type === TransactionType.PAYMENT
                    ? 'bg-green-100'
                    : 'bg-red-100'
                }`}
              >
                {transaction.type === TransactionType.INCOME || transaction.type === TransactionType.PAYMENT ? (
                  <ArrowDownCircle size={20} className="text-green-600" />
                ) : (
                  <ArrowUpCircle size={20} className="text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {transaction.customer?.name || transaction.supplier?.name || 'İşlem'}
                </p>
                <p className="text-sm text-gray-600">{transaction.description || 'Açıklama yok'}</p>
                {transaction.product && (
                  <p className="text-xs text-gray-500 mt-1">
                    {transaction.product.name}
                    {transaction.quantity && ` (${transaction.quantity} adet)`}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {formatDateTime(transaction.date)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  transaction.type === TransactionType.INCOME
                    || transaction.type === TransactionType.PAYMENT
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {transaction.type === TransactionType.INCOME || transaction.type === TransactionType.PAYMENT ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
              <Badge
                variant={
                  transaction.type === TransactionType.INCOME
                    ? 'success'
                    : transaction.type === TransactionType.PURCHASE
                      ? 'warning'
                      : transaction.type === TransactionType.PAYMENT
                        ? 'info'
                        : 'danger'
                }
                className="mt-1"
              >
                {transaction.type === TransactionType.INCOME
                  ? 'Tahsilat'
                  : transaction.type === TransactionType.PURCHASE
                    ? 'Alış'
                    : transaction.type === TransactionType.PAYMENT
                      ? 'Ödeme'
                      : 'Satış'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentActivities;
