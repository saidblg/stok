import { Supplier } from '../../types';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/Table';
import Badge from '../ui/Badge';
import { Phone, Mail, MapPin } from 'lucide-react';

interface SupplierListProps {
  suppliers: Supplier[];
  onSupplierClick: (supplier: Supplier) => void;
}

const SupplierList = ({ suppliers, onSupplierClick }: SupplierListProps) => {
  if (suppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Henüz tedarikçi bulunmuyor</p>
        <p className="text-gray-400 text-sm mt-2">
          Yukarıdaki formu kullanarak yeni tedarikçi ekleyebilirsiniz
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Tedarikçi Adı</TableHeader>
            <TableHeader>İletişim</TableHeader>
            <TableHeader>Adres</TableHeader>
            <TableHeader>İşlemler</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow
              key={supplier.id}
              onClick={() => onSupplierClick(supplier)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell>
                <div>
                  <p className="font-medium text-gray-900">{supplier.name || 'İsimsiz Tedarikçi'}</p>
                  {supplier.notes && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {supplier.notes}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {supplier.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-2" />
                      {supplier.phone}
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={14} className="mr-2" />
                      {supplier.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {supplier.address ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-2" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="info">Detay Gör</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SupplierList;
