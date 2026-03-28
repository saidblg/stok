import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema } from '../../utils/validation';
import { Customer, UpdateCustomerData, Role, TransactionType } from '../../types';
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from '../../hooks/useCustomers';
import { formatCurrency } from '../../utils/format';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Loading from '../ui/Loading';
import TransactionForm from '../transactions/TransactionForm';
import CustomerTransactions from './CustomerTransactions';
import { useAuth } from '../../hooks/useAuth';
import { Save, Trash2, User, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailModal = ({ customer, isOpen, onClose }: CustomerDetailModalProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);

  const { data: customerDetail, isLoading } = useCustomer(customer?.id || '');
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateCustomerData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (customerDetail) {
      reset({
        name: customerDetail.name ?? '',
        phone: customerDetail.phone || '',
        email: customerDetail.email || '',
        address: customerDetail.address || '',
        notes: customerDetail.notes || '',
      });
    }
  }, [customerDetail, reset]);

  const onSubmit = async (data: UpdateCustomerData) => {
    if (!customer) return;
    await updateCustomer.mutateAsync({ id: customer.id, data });
    setShowInfoForm(false);
  };

  const handleDelete = async () => {
    if (!customer) return;
    if (
      window.confirm(
        'Bu müşteriyi ve tüm işlemlerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!'
      )
    ) {
      await deleteCustomer.mutateAsync(customer.id);
      onClose();
    }
  };

  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" title="Müşteri Detayı">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={32} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {customerDetail?.name || 'İsimsiz Müşteri'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">Müşteri Detayları</p>
              </div>
            </div>
            {isAdmin && (
              <Button variant="danger" onClick={handleDelete} className="self-start sm:self-auto">
                <Trash2 size={16} className="mr-1" />
                Müşteriyi Sil
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Borç</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(customerDetail?.balance.balance || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Wallet size={24} className="text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Satış</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {formatCurrency(customerDetail?.balance.totalExpense || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingUp size={24} className="text-red-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Tahsilat</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(customerDetail?.balance.totalIncome || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingDown size={24} className="text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Müşteri Bilgileri</h3>
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
                  <Input label="Müşteri Adı" error={errors.name?.message} {...register('name')} />
                  <Input label="Telefon" error={errors.phone?.message} {...register('phone')} />
                  <Input label="E-posta" error={errors.email?.message} {...register('email')} />
                  <Input label="Adres" error={errors.address?.message} {...register('address')} />
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
                </div>

                <Button type="submit" loading={updateCustomer.isPending}>
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
                customerId={customer.id}
                allowedTypes={[TransactionType.EXPENSE, TransactionType.INCOME]}
                onSuccess={() => setShowTransactionForm(false)}
              />
            )}
          </Card>

          <Card>
            <CustomerTransactions customerId={customer.id} />
          </Card>
        </div>
      )}
    </Modal>
  );
};

export default CustomerDetailModal;
