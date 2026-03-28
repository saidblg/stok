import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../utils/validation';
import { CreateProductData, ProductType } from '../../types';
import { useCreateProduct, useUploadProductImage } from '../../hooks/useProducts';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { ChevronUp, Image as ImageIcon, Plus, Upload } from 'lucide-react';

const ProductForm = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const createProduct = useCreateProduct();
  const uploadImage = useUploadProductImage();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      lowStockThreshold: 10,
      productType: ProductType.ADET,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateProductData) => {
    const createdProduct = await createProduct.mutateAsync(data);

    if (selectedFile) {
      await uploadImage.mutateAsync({ id: createdProduct.id, file: selectedFile });
    }

    reset();
    setSelectedFile(null);
    setImagePreview(null);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ürün Görseli (Opsiyonel)
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Ürün görseli"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                  <ImageIcon size={28} className="text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="create-product-image"
                />
                <label
                  htmlFor="create-product-image"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 cursor-pointer"
                >
                  <Upload size={16} className="mr-1" />
                  Görsel Yükle
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG veya WEBP (Max. 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ürün Adı"
              placeholder="Ürün adını girin"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Tipi</label>
              <select
                {...register('productType')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ProductType.ADET}>Adet</option>
                <option value={ProductType.KOLI}>Koli</option>
              </select>
              {errors.productType && (
                <p className="mt-1 text-sm text-red-600">{errors.productType.message}</p>
              )}
            </div>

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

          <Button type="submit" loading={createProduct.isPending || uploadImage.isPending}>
            <Plus size={18} className="mr-1" />
            Ürün Ekle
          </Button>
        </form>
      )}
    </Card>
  );
};

export default ProductForm;
