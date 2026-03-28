import { FormEvent, useEffect, useState } from 'react';
import { CreateInvoiceData, Invoice, InvoiceType, VatRate } from '../../types';
import { toIsoWithCurrentTime } from '../../utils/date';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface InvoiceFormProps {
  initialValues?: Invoice | null;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (data: CreateInvoiceData) => Promise<void>;
  onCancel?: () => void;
}

const InvoiceForm = ({
  initialValues,
  loading = false,
  submitLabel = 'Kaydet',
  onSubmit,
  onCancel,
}: InvoiceFormProps) => {
  const [type, setType] = useState<InvoiceType>(InvoiceType.INCOMING);
  const [amount, setAmount] = useState('');
  const [vatRate, setVatRate] = useState<VatRate>(VatRate.VAT_1);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialValues) {
      setType(InvoiceType.INCOMING);
      setAmount('');
      setVatRate(VatRate.VAT_1);
      setDate('');
      setNote('');
      setErrors({});
      return;
    }

    setType(initialValues.type);
    setAmount(String(initialValues.amount));
    setVatRate(initialValues.vatRate);
    setDate(initialValues.date.slice(0, 10));
    setNote(initialValues.note || '');
    setErrors({});
  }, [initialValues]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = 'Tutar 0’dan büyük olmalıdır';
    }

    if (!date) {
      nextErrors.date = 'Tarih zorunludur';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      type,
      amount: Number(amount),
      vatRate,
      date: toIsoWithCurrentTime(date),
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İşlem Türü</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as InvoiceType)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={InvoiceType.INCOMING}>Gelen Fatura</option>
            <option value={InvoiceType.OUTGOING}>Giden Fatura</option>
          </select>
        </div>

        <Input
          label="Fatura Tutarı"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          placeholder="0.00"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">KDV Oranı</label>
          <select
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value as VatRate)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={VatRate.VAT_1}>%1</option>
            <option value={VatRate.VAT_10}>%10</option>
          </select>
        </div>

        <Input
          label="Tarih"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Not</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Fatura notu"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" loading={loading}>{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            İptal
          </Button>
        )}
      </div>
    </form>
  );
};

export default InvoiceForm;
