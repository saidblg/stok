import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { CreateInvoiceData, Invoice } from '../types';
import { useCreateInvoice, useDeleteInvoice, useInvoices, useUpdateInvoice } from '../hooks/useInvoices';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoiceList from '../components/invoices/InvoiceList';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';

const InvoicesPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const { data, isLoading, isError } = useInvoices({ page: 1, limit: 100 });
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const handleCreate = async (payload: CreateInvoiceData) => {
    await createInvoice.mutateAsync(payload);
    setIsCreateOpen(false);
  };

  const handleEdit = async (payload: CreateInvoiceData) => {
    if (!editingInvoice) {
      return;
    }

    await updateInvoice.mutateAsync({ id: editingInvoice.id, data: payload });
    setEditingInvoice(null);
  };

  const handleDelete = async (invoice: Invoice) => {
    if (!window.confirm('Bu faturayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    await deleteInvoice.mutateAsync(invoice.id);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Faturalar</h1>
        <p className="text-gray-600 mt-1">Gelen ve giden faturalarınızı kaydedin ve yönetin</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setIsCreateOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Plus size={16} className="text-blue-600" />
            Yeni İşlem Oluştur
          </span>
          {isCreateOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isCreateOpen && (
          <div className="border-t border-gray-100 p-4">
            <InvoiceForm onSubmit={handleCreate} loading={createInvoice.isPending} submitLabel="Fatura Oluştur" />
          </div>
        )}
      </div>

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Faturalar yüklenirken bir hata oluştu.
        </div>
      ) : (
        <InvoiceList
          invoices={data?.data || []}
          onEdit={setEditingInvoice}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={!!editingInvoice}
        onClose={() => setEditingInvoice(null)}
        title="Fatura Düzenle"
        size="lg"
      >
        <InvoiceForm
          initialValues={editingInvoice}
          onSubmit={handleEdit}
          loading={updateInvoice.isPending}
          submitLabel="Güncelle"
          onCancel={() => setEditingInvoice(null)}
        />
      </Modal>
    </div>
  );
};

export default InvoicesPage;
