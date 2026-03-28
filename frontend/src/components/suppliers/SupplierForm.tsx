import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema } from '../../utils/validation';
import { CreateSupplierData } from '../../types';
import { useCreateSupplier } from '../../hooks/useSuppliers';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Truck } from 'lucide-react';

interface SupplierFormProps {
  onSuccess?: () => void;
}

const normalizePayload = (data: CreateSupplierData): CreateSupplierData => ({
  name: data.name?.trim() || undefined,
  phone: data.phone?.trim() || undefined,
  email: data.email?.trim() || undefined,
  address: data.address?.trim() || undefined,
  notes: data.notes?.trim() || undefined,
});

const SupplierForm = ({ onSuccess }: SupplierFormProps) => {
  const createSupplier = useCreateSupplier();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSupplierData>({
    resolver: zodResolver(supplierSchema),
  });

  const onSubmit = async (data: CreateSupplierData) => {
    await createSupplier.mutateAsync(normalizePayload(data));
    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Tedarikçi Adı"
          placeholder="Tedarikçi adı (opsiyonel)"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Telefon"
          placeholder="0555 555 55 55"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="E-posta"
          type="email"
          placeholder="ornek@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Adres"
          placeholder="Tedarikçi adresi"
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
          placeholder="Tedarikçi hakkında notlar..."
          {...register('notes')}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <Button type="submit" loading={createSupplier.isPending}>
        <Truck size={18} className="mr-1" />
        Tedarikçi Ekle
      </Button>
    </form>
  );
};

export default SupplierForm;
