import { FormEvent, useMemo, useState } from 'react';
import {
  CreateTransactionData,
  CreateTransactionItemData,
  PaymentMethod,
  TransactionType,
} from '../../types';
import { useCreateTransaction } from '../../hooks/useTransactions';
import { useCustomers } from '../../hooks/useCustomers';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/format';
import { toIsoWithCurrentTime } from '../../utils/date';
import Input from '../ui/Input';
import Button from '../ui/Button';
import MultiProductSelector from './MultiProductSelector';
import { Plus } from 'lucide-react';

interface TransactionFormProps {
  customerId?: string;
  supplierId?: string;
  allowedTypes?: TransactionType[];
  onSuccess?: () => void;
}

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const TransactionForm = ({ customerId, supplierId, allowedTypes, onSuccess }: TransactionFormProps) => {
  const createTransaction = useCreateTransaction();

  const resolvedAllowedTypes = useMemo(() => {
    if (allowedTypes && allowedTypes.length > 0) {
      return allowedTypes;
    }

    if (supplierId) {
      return [TransactionType.PURCHASE, TransactionType.PAYMENT];
    }

    if (customerId) {
      return [TransactionType.EXPENSE, TransactionType.INCOME];
    }

    return [TransactionType.EXPENSE, TransactionType.INCOME, TransactionType.PURCHASE, TransactionType.PAYMENT];
  }, [allowedTypes, customerId, supplierId]);

  const [type, setType] = useState<TransactionType>(resolvedAllowedTypes[0]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const [selectedSupplierId, setSelectedSupplierId] = useState(supplierId || '');
  const [items, setItems] = useState<CreateTransactionItemData[]>([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: customersData } = useCustomers({ page: 1, limit: 1000 });
  const { data: suppliersData } = useSuppliers({ page: 1, limit: 1000 });
  const { data: productsData } = useProducts({ page: 1, limit: 1000 });

  const customers = customersData?.data || [];
  const suppliers = suppliersData?.data || [];
  const products = productsData?.data || [];

  const isIncome = type === TransactionType.INCOME;
  const isPurchase = type === TransactionType.PURCHASE;
  const isPayment = type === TransactionType.PAYMENT;
  const requiresItems = type === TransactionType.EXPENSE || type === TransactionType.PURCHASE;

  const numericAmount = Number(amount || 0);
  const effectivePayment =
    isPayment && !Number.isNaN(numericAmount) && numericAmount > 0
      ? paymentMethod === PaymentMethod.CARD
        ? roundMoney(numericAmount * 0.97)
        : roundMoney(numericAmount)
      : 0;

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (isPurchase || isPayment) {
      if (!selectedSupplierId) {
        nextErrors.supplierId = 'Tedarikçi seçilmelidir';
      }
    }

    if (!isPurchase && !isPayment) {
      if (!selectedCustomerId) {
        nextErrors.customerId = 'Müşteri seçilmelidir';
      }
    }

    if (isIncome || isPayment) {
      if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
        nextErrors.amount = `${type} için geçerli bir tutar giriniz`;
      }
    }

    if (isPayment && !paymentMethod) {
      nextErrors.paymentMethod = 'Ödeme yöntemi seçilmelidir';
    }

    if (requiresItems) {
      if (items.length === 0) {
        nextErrors.items = 'En az 1 ürün eklenmelidir';
      }

      const invalidItem = items.some((item) => !item.productId || item.quantity < 1);
      if (invalidItem) {
        nextErrors.items = 'Tüm kalemlerde ürün seçimi ve geçerli miktar zorunludur';
      }

      if (type === TransactionType.EXPENSE) {
        const requiredByProduct = new Map<string, number>();
        for (const item of items) {
          const current = requiredByProduct.get(item.productId) || 0;
          requiredByProduct.set(item.productId, current + item.quantity);
        }

        for (const [productId, requiredQty] of requiredByProduct.entries()) {
          const product = products.find((p) => p.id === productId);
          if (product && product.stock < requiredQty) {
            nextErrors.items = `Yetersiz stok: ${product.name} (Mevcut: ${product.stock}, İstenen: ${requiredQty})`;
            break;
          }
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setDescription('');
    setDate('');
    setAmount('');
    setItems([]);
    setPaymentMethod(PaymentMethod.CASH);
    setErrors({});

    if (!customerId) {
      setSelectedCustomerId('');
    }
    if (!supplierId) {
      setSelectedSupplierId('');
    }
  };

  const handleTypeChange = (value: TransactionType) => {
    setType(value);
    setErrors({});

    if (value === TransactionType.PURCHASE || value === TransactionType.PAYMENT) {
      if (!supplierId) {
        setSelectedSupplierId('');
      }
      if (!customerId) {
        setSelectedCustomerId('');
      }
    } else {
      if (!customerId) {
        setSelectedCustomerId('');
      }
      if (!supplierId) {
        setSelectedSupplierId('');
      }
    }

    if (value === TransactionType.INCOME || value === TransactionType.PAYMENT) {
      setItems([]);
    }

    if (value !== TransactionType.INCOME && value !== TransactionType.PAYMENT) {
      setAmount('');
    }

    if (value !== TransactionType.PAYMENT) {
      setPaymentMethod(PaymentMethod.CASH);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload: CreateTransactionData = {
      type,
      description: description.trim() || undefined,
      date: date ? toIsoWithCurrentTime(date) : undefined,
      customerId: isPurchase || isPayment ? undefined : selectedCustomerId,
      supplierId: isPurchase || isPayment ? selectedSupplierId : undefined,
      paymentMethod: isPayment ? paymentMethod : undefined,
      amount: isIncome || isPayment ? Number(amount) : undefined,
      items: requiresItems ? items : undefined,
    };

    await createTransaction.mutateAsync(payload);
    resetForm();
    onSuccess?.();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Tipi</label>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {resolvedAllowedTypes.includes(TransactionType.EXPENSE) && (
            <option value={TransactionType.EXPENSE}>Satış (EXPENSE)</option>
          )}
          {resolvedAllowedTypes.includes(TransactionType.INCOME) && (
            <option value={TransactionType.INCOME}>Tahsilat (INCOME)</option>
          )}
          {resolvedAllowedTypes.includes(TransactionType.PURCHASE) && (
            <option value={TransactionType.PURCHASE}>Mal Alışı (PURCHASE)</option>
          )}
          {resolvedAllowedTypes.includes(TransactionType.PAYMENT) && (
            <option value={TransactionType.PAYMENT}>Tedarikçiye Ödeme (PAYMENT)</option>
          )}
        </select>
      </div>

      {isPurchase || isPayment ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tedarikçi</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            disabled={!!supplierId}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Tedarikçi seçiniz</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name || 'İsimsiz Tedarikçi'}
              </option>
            ))}
          </select>
          {errors.supplierId && <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            disabled={!!customerId}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Müşteri seçiniz</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name || 'İsimsiz Müşteri'}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
        </div>
      )}

      {requiresItems && (
        <MultiProductSelector
          items={items}
          onChange={setItems}
          type={type === TransactionType.PURCHASE ? 'PURCHASE' : 'EXPENSE'}
          error={errors.items}
        />
      )}

      {(isIncome || isPayment) && (
        <Input
          label={isPayment ? 'Ödeme Tutarı (Brüt)' : 'Tutar'}
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          placeholder="0.00"
        />
      )}

      {isPayment && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={PaymentMethod.CASH}>Nakit (CASH)</option>
              <option value={PaymentMethod.CARD}>Kart (CARD)</option>
            </select>
            {errors.paymentMethod && <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>}
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {paymentMethod === PaymentMethod.CARD
              ? `%3 komisyon sonrası etkili ödeme: ${formatCurrency(effectivePayment)}`
              : `Etkili ödeme: ${formatCurrency(effectivePayment)}`}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama (Opsiyonel)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="İşlem açıklaması"
        />
      </div>

      <Input
        label="Tarih"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <Button type="submit" fullWidth loading={createTransaction.isPending}>
        <Plus size={18} className="mr-1" />
        İşlem Ekle
      </Button>
    </form>
  );
};

export default TransactionForm;
