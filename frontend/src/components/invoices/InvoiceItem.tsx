import { Invoice, InvoiceType, VatRate } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

interface InvoiceItemProps {
  invoice: Invoice;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

const typeLabelMap: Record<InvoiceType, string> = {
  [InvoiceType.INCOMING]: 'Gelen Fatura',
  [InvoiceType.OUTGOING]: 'Giden Fatura',
};

const vatLabelMap: Record<VatRate, string> = {
  [VatRate.VAT_1]: '%1',
  [VatRate.VAT_10]: '%10',
};

const InvoiceItem = ({ invoice, onEdit, onDelete }: InvoiceItemProps) => {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={invoice.type === InvoiceType.INCOMING ? 'success' : 'info'}>
              {typeLabelMap[invoice.type]}
            </Badge>
            <Badge variant="warning">KDV {vatLabelMap[invoice.vatRate]}</Badge>
            <span className="text-xs text-gray-500">{formatDate(invoice.date)}</span>
          </div>

          <p className="text-xl font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
          <p className="text-sm text-gray-600">{invoice.note || 'Not yok'}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => onEdit(invoice)}>
            <Pencil size={16} />
          </Button>
          <Button variant="danger" onClick={() => onDelete(invoice)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItem;
