import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../utils/validation';
import { CreateProductData } from '../../types';
import { useCreateProduct } from '../../hooks/useProducts';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { ChevronUp, Plus } from 'lucide-react';

const ProductForm = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const createProduct = useCreateProduct();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      lowStockThreshold: 10,
    },
  });

  const onSubmit = async (data: CreateProductData) => {
    await createProduct.mutateAsync(data);
    reset();
    setIsExpanded(false);
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Yeni Ürün Ekle</h2>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="px-3 py-1.5 text-sm"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} className="mr-1" />
              Formu Gizle
            </>
          ) : (
            <>
              <Plus size={16} className="mr-1" />
              Yeni Ürün
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ürün Adı"
              placeholder="Ürün adını girin"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Alış Fiyatı"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.purchasePrice?.message}
              {...register('purchasePrice', { valueAsNumber: true })}
            />

            <Input
              label="Satış Fiyatı"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.salePrice?.message}
              {...register('salePrice', { valueAsNumber: true })}
            />

            <Input
              label="Stok Miktarı"
              type="number"
              placeholder="0"
              error={errors.stock?.message}
              {...register('stock', { valueAsNumber: true })}
            />

            <Input
              label="Düşük Stok Eşiği"
              type="number"
              placeholder="10"
              error={errors.lowStockThreshold?.message}
              {...register('lowStockThreshold', { valueAsNumber: true })}
            />
          </div>

          <Button type="submit" loading={createProduct.isPending}>
            <Plus size={18} className="mr-1" />
            Ürün Ekle
          </Button>
        </form>
      )}
    </Card>
  );
};

export default ProductForm;
