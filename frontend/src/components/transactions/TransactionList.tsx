import { Transaction } from '../../types';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  showDelete?: boolean;
  showDescription?: boolean;
}

const TransactionList = ({
  transactions,
  onDelete,
  showDelete = true,
  showDescription = true,
}: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Henüz işlem bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onDelete={onDelete}
          showDelete={showDelete}
          showDescription={showDescription}
        />
      ))}
    </div>
  );
};

export default TransactionList;
