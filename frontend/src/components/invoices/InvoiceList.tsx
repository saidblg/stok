import { Invoice } from '../../types';
import InvoiceItem from './InvoiceItem';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

const InvoiceList = ({ invoices, onEdit, onDelete }: InvoiceListProps) => {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="text-gray-500">Henüz fatura kaydı bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <InvoiceItem key={invoice.id} invoice={invoice} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default InvoiceList;
