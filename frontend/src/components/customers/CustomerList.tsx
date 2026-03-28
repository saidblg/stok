import { Customer } from '../../types';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/Table';
import Badge from '../ui/Badge';
import { Phone, Mail, MapPin } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onCustomerClick: (customer: Customer) => void;
}

const CustomerList = ({ customers, onCustomerClick }: CustomerListProps) => {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Henüz müşteri bulunmuyor</p>
        <p className="text-gray-400 text-sm mt-2">
          Yukarıdaki formu kullanarak yeni müşteri ekleyebilirsiniz
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Müşteri Adı</TableHeader>
            <TableHeader>İletişim</TableHeader>
            <TableHeader>Adres</TableHeader>
            <TableHeader>İşlemler</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow
              key={customer.id}
              onClick={() => onCustomerClick(customer)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell>
                <div>
                  <p className="font-medium text-gray-900">{customer.name || 'İsimsiz Müşteri'}</p>
                  {customer.notes && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {customer.notes}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {customer.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-2" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail size={14} className="mr-2" />
                      {customer.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {customer.address ? (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-2" />
                    <span className="line-clamp-2">{customer.address}</span>
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

export default CustomerList;
