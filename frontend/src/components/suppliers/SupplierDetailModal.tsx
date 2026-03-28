import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema } from '../../utils/validation';
import { Supplier, UpdateSupplierData, Role, TransactionType } from '../../types';
import { useSupplier, useUpdateSupplier, useDeleteSupplier } from '../../hooks/useSuppliers';
import { formatCurrency } from '../../utils/format';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Loading from '../ui/Loading';
import TransactionForm from '../transactions/TransactionForm';
import SupplierTransactions from './SupplierTransactions';
import { useAuth } from '../../hooks/useAuth';
import { Save, Trash2, Truck, Wallet, ShoppingCart } from 'lucide-react';

interface SupplierDetailModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

const SupplierDetailModal = ({ supplier, isOpen, onClose }: SupplierDetailModalProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);

  const { data: supplierDetail, isLoading } = useSupplier(supplier?.id || '');
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateSupplierData>({
    resolver: zodResolver(supplierSchema),
  });

  useEffect(() => {
    if (supplierDetail) {
      reset({
        name: supplierDetail.name ?? '',
        phone: supplierDetail.phone || '',
        email: supplierDetail.email || '',
        address: supplierDetail.address || '',
        notes: supplierDetail.notes || '',
      });
    }
  }, [supplierDetail, reset]);

  const onSubmit = async (data: UpdateSupplierData) => {
    if (!supplier) return;
    await updateSupplier.mutateAsync({ id: supplier.id, data });
    setShowInfoForm(false);
  };

  const handleDelete = async () => {
    if (!supplier) return;
    if (
      window.confirm(
        'Bu tedarikçiyi ve tüm işlemlerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!'
      )
    ) {
      await deleteSupplier.mutateAsync(supplier.id);
      onClose();
    }
  };

  if (!supplier) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" title="Tedarikçi Detayı">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                <Truck size={32} className="text-teal-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {supplierDetail?.name || 'İsimsiz Tedarikçi'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Tedarikçi Detayları</p>
              </div>
            </div>
            {isAdmin && (
              <Button variant="danger" onClick={handleDelete} className="self-start sm:self-auto">
                <Trash2 size={16} className="mr-1" />
                Tedarikçiyi Sil
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingCart size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Alış</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(supplierDetail?.balance?.totalPurchases || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Wallet size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Ödeme</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(supplierDetail?.balance?.totalPayments || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Wallet size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tedarikçi Borcu</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(supplierDetail?.balance?.balance || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tedarikçi Bilgileri</h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowInfoForm((prev) => !prev)}
              >
                {showInfoForm ? 'Formu Gizle' : 'Formu Göster'}
              </Button>
            </div>

            {showInfoForm && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tedarikçi Adı"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    label="Telefon"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />

                  <Input
                    label="E-posta"
                    type="email"
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Input
                    label="Adres"
                    error={errors.address?.message}
                    {...register('address')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notlar
                  </label>
                  <textarea
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    {...register('notes')}
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                  )}
                </div>

                <Button type="submit" loading={updateSupplier.isPending}>
                  <Save size={16} className="mr-1" />
                  Bilgileri Güncelle
                </Button>
              </form>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Yeni İşlem Ekle</h3>
              <Button
                variant="secondary"
                onClick={() => setShowTransactionForm(!showTransactionForm)}
              >
                {showTransactionForm ? 'Formu Gizle' : 'Formu Göster'}
              </Button>
            </div>

            {showTransactionForm && (
              <TransactionForm
                supplierId={supplier.id}
                allowedTypes={[TransactionType.PURCHASE, TransactionType.PAYMENT]}
                onSuccess={() => setShowTransactionForm(false)}
              />
            )}
          </Card>

          <Card>
            <SupplierTransactions supplierId={supplier.id} />
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default SupplierDetailModal;
