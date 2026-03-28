import { useEffect, useState } from 'react';
import { Product } from '../types';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import ProductForm from '../components/products/ProductForm';
import ProductList from '../components/products/ProductList';
import ProductEditModal from '../components/products/ProductEditModal';
import Loading from '../components/ui/Loading';
import Input from '../components/ui/Input';
import { Search } from 'lucide-react';

const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useProducts({ search: debouncedSearch });
  const deleteProduct = useDeleteProduct();

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
        <p className="text-gray-600 mt-1">Ürünlerinizi ekleyin ve yönetin</p>
      </div>

      <ProductForm />

      <div>
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder="Ürün ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ProductList
          products={data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ProductEditModal
        product={selectedProduct}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      />
    </div>
  );
};

export default ProductsPage;
