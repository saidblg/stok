import { Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Edit, Trash2, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;
  const isLowStock = product.stock <= product.lowStockThreshold;
  const productTypeLabel = product.productType === 'KOLI' ? 'Koli' : 'Adet';

  return (
    <Card padding={false}>
      <div className="relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <Package size={48} className="text-gray-400" />
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning">Düşük Stok</Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name} - {productTypeLabel}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Alış Fiyatı:</span>
            <span className="font-medium">{formatCurrency(product.purchasePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Satış Fiyatı:</span>
            <span className="font-medium text-blue-600">
              {formatCurrency(product.salePrice)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Stok:</span>
            <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
              {product.stock}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="secondary" fullWidth onClick={() => onEdit(product)}>
            <Edit size={16} className="mr-1" />
            Düzenle
          </Button>
          {isAdmin && (
            <Button variant="danger" onClick={() => onDelete(product.id)}>
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
