import { Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { AlertTriangle } from 'lucide-react';

interface LowStockAlertProps {
  products: Product[];
}

const LowStockAlert = ({ products }: LowStockAlertProps) => {
  if (products.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Düşük Stok Uyarısı</h3>
        <div className="text-center py-8">
          <p className="text-green-600 font-medium">Tüm ürünlerin stoğu yeterli</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Düşük Stok Uyarısı</h3>
        <Badge variant="warning">{products.length} ürün</Badge>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-yellow-600" />
              </div>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Görsel Yok</span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">
                  Satış: {formatCurrency(product.salePrice)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-yellow-700">{product.stock}</p>
              <p className="text-xs text-gray-500">
                Eşik: {product.lowStockThreshold}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LowStockAlert;
