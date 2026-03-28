import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateTransactionData, CreateTransactionItemData, TransactionType } from '../../types';
import { useCreateTransaction } from '../../hooks/useTransactions';
import { toIsoWithCurrentTime } from '../../utils/date';
import Input from '../ui/Input';
import Button from '../ui/Button';
import MultiProductSelector from './MultiProductSelector';
import { ShoppingCart } from 'lucide-react';

interface PurchaseTransactionFormProps {
  supplierId: string;
  onSuccess?: () => void;
}

const PurchaseTransactionForm = ({ supplierId, onSuccess }: PurchaseTransactionFormProps) => {
  const createTransaction = useCreateTransaction();
  const [items, setItems] = useState<CreateTransactionItemData[]>([]);
  const [itemsError, setItemsError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTransactionData>({
    defaultValues: {
      supplierId,
      type: TransactionType.PURCHASE,
      description: '',
    },
  });

  const onSubmit = async (data: CreateTransactionData) => {
    // Validate items
    if (items.length === 0) {
      setItemsError('En az 1 ürün eklenmelidir');
      return;
    }

    // Check if all items have valid productId
    const invalidItems = items.filter(item => !item.productId);
    if (invalidItems.length > 0) {
      setItemsError('Tüm ürünler için ürün seçilmelidir');
      return;
    }

    setItemsError('');

    await createTransaction.mutateAsync({
      ...data,
      supplierId,
      type: TransactionType.PURCHASE,
      date: data.date ? toIsoWithCurrentTime(data.date) : undefined,
      items,
    });

    reset({
      supplierId,
      type: TransactionType.PURCHASE,
      description: '',
    });
    setItems([]);
    onSuccess?.();
  };

  const handleItemsChange = (newItems: CreateTransactionItemData[]) => {
    setItems(newItems);
    if (newItems.length > 0) {
      setItemsError('');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <MultiProductSelector
        items={items}
        onChange={handleItemsChange}
        type="PURCHASE"
        error={itemsError}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Açıklama *
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Mal alışı açıklaması"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <Input
        label="Tarih"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      <Button type="submit" fullWidth loading={createTransaction.isPending}>
        <ShoppingCart size={18} className="mr-1" />
        Mal Alışı Ekle
      </Button>
    </form>
  );
};

export default PurchaseTransactionForm;
