import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../utils/validation';
import { Product, ProductType, UpdateProductData } from '../../types';
import { useUpdateProduct, useUploadProductImage } from '../../hooks/useProducts';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductEditModal = ({ product, isOpen, onClose }: ProductEditModalProps) => {
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProductData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        productType: product.productType,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
      });
      setImagePreview(product.image);
      setSelectedFile(null);
    }
  }, [product, reset]);

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

  const onSubmit = async (data: UpdateProductData) => {
    if (!product) return;

    try {
      await updateProduct.mutateAsync({ id: product.id, data });

      if (selectedFile) {
        await uploadImage.mutateAsync({ id: product.id, file: selectedFile });
      }

      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ürün Düzenle" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ürün Görseli
          </label>
          <div className="flex items-center space-x-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Ürün görseli"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                <ImageIcon size={32} className="text-gray-400" />
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="product-image"
              />
              <label
                htmlFor="product-image"
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
          <div className="md:col-span-2">
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
            label="Ürün Adı"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Alış Fiyatı"
            type="number"
            step="0.01"
            error={errors.purchasePrice?.message}
            {...register('purchasePrice', { valueAsNumber: true })}
          />

          <Input
            label="Satış Fiyatı"
            type="number"
            step="0.01"
            error={errors.salePrice?.message}
            {...register('salePrice', { valueAsNumber: true })}
          />

          <Input
            label="Stok Miktarı"
            type="number"
            error={errors.stock?.message}
            {...register('stock', { valueAsNumber: true })}
          />

          <Input
            label="Düşük Stok Eşiği"
            type="number"
            error={errors.lowStockThreshold?.message}
            {...register('lowStockThreshold', { valueAsNumber: true })}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            İptal
          </Button>
          <Button
            type="submit"
            loading={updateProduct.isPending || uploadImage.isPending}
          >
            Güncelle
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductEditModal;
