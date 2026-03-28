import { useState, useEffect } from 'react';
import { CreateTransactionItemData } from '../../types';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

interface MultiProductSelectorProps {
  items: CreateTransactionItemData[];
  onChange: (items: CreateTransactionItemData[]) => void;
  type: 'EXPENSE' | 'PURCHASE';
  error?: string;
}

const MultiProductSelector = ({ items, onChange, type, error }: MultiProductSelectorProps) => {
  const { data: productsData } = useProducts({ page: 1, limit: 1000 });
  const products = productsData?.data || [];
  const [selectedProducts, setSelectedProducts] = useState<CreateTransactionItemData[]>(items);

  useEffect(() => {
    setSelectedProducts(items);
  }, [items]);

  const addProduct = () => {
    const newProduct: CreateTransactionItemData = {
      productId: '',
      quantity: 1,
    };
    const updated = [...selectedProducts, newProduct];
    setSelectedProducts(updated);
    onChange(updated);
  };

  const removeProduct = (index: number) => {
    const updated = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updated);
    onChange(updated);
  };

  const updateProduct = (index: number, field: keyof CreateTransactionItemData, value: string | number) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedProducts(updated);
    onChange(updated);
  };

  const calculateSubtotal = (productId: string, quantity: number): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    const price = type === 'PURCHASE' ? product.purchasePrice : product.salePrice;
    return price * quantity;
  };

  const calculateTotal = (): number => {
    return selectedProducts.reduce((total, item) => {
      if (!item.productId || !item.quantity) return total;
      return total + calculateSubtotal(item.productId, item.quantity);
    }, 0);
  };

  const getProductStock = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    return product?.stock || 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Ürünler {type === 'EXPENSE' ? '(Satış)' : '(Alış)'}
        </label>
        <Button type="button" variant="secondary" onClick={addProduct}>
          <Plus size={16} className="mr-1" />
          Ürün Ekle
        </Button>
      </div>

      {selectedProducts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Henüz ürün eklenmedi</p>
          <p className="text-sm text-gray-400 mt-1">Yukarıdaki "Ürün Ekle" butonuna tıklayın</p>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedProducts.map((item, index) => {
            const subtotal = calculateSubtotal(item.productId, item.quantity);
            const stock = getProductStock(item.productId);
            const isLowStock = type === 'EXPENSE' && item.quantity > stock;

            return (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-12 gap-3 items-start">
                  {/* Product Selector */}
                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ürün
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateProduct(index, 'productId', e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isLowStock ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Ürün Seçin</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(type === 'PURCHASE' ? product.purchasePrice : product.salePrice)}
                          {type === 'EXPENSE' && ` (Stok: ${product.stock})`}
                        </option>
                      ))}
                    </select>
                    {isLowStock && (
                      <p className="text-xs text-red-600 mt-1">
                        Yetersiz stok! Mevcut: {stock}
                      </p>
                    )}
                  </div>

                  {/* Quantity Input */}
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Miktar
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Subtotal Display */}
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ara Toplam
                    </label>
                    <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900">
                      {formatCurrency(subtotal)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 pt-6">
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Ürünü Kaldır"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Total Amount */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Toplam Tutar:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculateTotal())}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default MultiProductSelector;
