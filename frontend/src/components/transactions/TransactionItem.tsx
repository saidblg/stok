import { useState } from 'react';
import { Transaction, TransactionType, Role } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  showDelete?: boolean;
  showDescription?: boolean;
}

const typeLabelMap: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: 'Satış',
  [TransactionType.INCOME]: 'Tahsilat',
  [TransactionType.PURCHASE]: 'Mal Alışı',
  [TransactionType.PAYMENT]: 'Ödeme',
};

const TransactionItem = ({
  transaction,
  onDelete,
  showDelete = true,
  showDescription = true,
}: TransactionItemProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const [expanded, setExpanded] = useState(false);
  const partyName = transaction.customer?.name || transaction.supplier?.name || 'İşlem';

  const hasItems = transaction.items && transaction.items.length > 0;
  const totalQuantity = hasItems
    ? transaction.items.reduce((sum, item) => sum + item.quantity, 0)
    : (transaction.quantity || 0);

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center space-x-3">
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
            >
              {typeLabelMap[transaction.type]}
            </Badge>
            {transaction.type === TransactionType.PAYMENT && transaction.paymentMethod && (
              <Badge variant="info">
                {transaction.paymentMethod === 'CARD' ? 'Kart' : 'Nakit'}
              </Badge>
            )}
            <span className="text-sm text-gray-500">{formatDateTime(transaction.date)}</span>
          </div>

          <p className="mb-1 font-medium text-gray-900">
            {showDescription ? transaction.description || partyName : partyName}
          </p>

          {hasItems ? (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <span>
                {transaction.items.length} ürün, toplam {totalQuantity} adet
              </span>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          ) : transaction.product ? (
            <p className="text-sm text-gray-600">
              {transaction.product.name}
              {transaction.quantity ? ` × ${transaction.quantity} adet` : ''}
            </p>
          ) : transaction.type === TransactionType.PAYMENT ? (
            <p className="text-sm text-gray-600">
              Brüt: {formatCurrency(transaction.grossAmount || transaction.amount)} • Net: {formatCurrency(transaction.amount)}
            </p>
          ) : null}
        </div>

        <div className="flex items-center space-x-3">
          <p
            className={`text-lg font-bold ${
              transaction.type === TransactionType.INCOME || transaction.type === TransactionType.PAYMENT
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {formatCurrency(transaction.amount)}
          </p>

          {isAdmin && showDelete && (
            <Button
              variant="danger"
              onClick={() => onDelete(transaction.id)}
              title="Sil"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {expanded && hasItems && (
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
          {transaction.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {item.product.name} x {item.quantity}
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(item.unitPrice)} x {item.quantity} = {formatCurrency(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionItem;
