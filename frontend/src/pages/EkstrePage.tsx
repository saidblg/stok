import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useSuppliers } from '../hooks/useSuppliers';
import { useEkstrePreview, useEkstreDownload } from '../hooks/useEkstre';
import { EntityType } from '../types';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '../components/ui/Table';
import { Download, Eye, FileSpreadsheet, Users, Truck } from 'lucide-react';

const EkstrePage = () => {
  const [entityType, setEntityType] = useState<EntityType>(EntityType.CUSTOMER);
  const [entityId, setEntityId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const { data: customersData, isLoading: customersLoading } = useCustomers({
    limit: 1000,
  });

  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({
    limit: 1000,
  });

  const {
    data: previewData,
    isLoading: previewLoading,
    refetch: fetchPreview,
  } = useEkstrePreview(
    { entityType, entityId, startDate, endDate },
    { enabled: showPreview && !!entityId && !!startDate && !!endDate }
  );

  const { mutate: downloadExcel, isPending: downloadLoading } =
    useEkstreDownload();

  const handlePreview = () => {
    if (entityId && startDate && endDate) {
      setShowPreview(true);
      fetchPreview();
    }
  };

  const handleDownload = () => {
    if (entityId && startDate && endDate) {
      downloadExcel({ entityType, entityId, startDate, endDate });
    }
  };

  const handleEntityTypeChange = (type: EntityType) => {
    setEntityType(type);
    setEntityId('');
    setShowPreview(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString('tr-TR');
  };

  const isFormValid = entityId && startDate && endDate;
  const isLoading = customersLoading || suppliersLoading;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  const entities = entityType === EntityType.CUSTOMER
    ? customersData?.data || []
    : suppliersData?.data || [];

  const entityLabel = entityType === EntityType.CUSTOMER ? 'Müşteri' : 'Tedarikçi';
  const emptyLabel = entityType === EntityType.CUSTOMER ? 'İsimsiz Müşteri' : 'İsimsiz Tedarikçi';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hesap Ekstresi</h1>
        <p className="text-gray-600 mt-1">
          Müşteri veya tedarikçi hesap hareketlerini görüntüleyin ve Excel olarak indirin
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {/* Entity Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hesap Türü
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleEntityTypeChange(EntityType.CUSTOMER)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                entityType === EntityType.CUSTOMER
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users size={18} />
              Müşteri
            </button>
            <button
              type="button"
              onClick={() => handleEntityTypeChange(EntityType.SUPPLIER)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                entityType === EntityType.SUPPLIER
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Truck size={18} />
              Tedarikçi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {entityLabel}
            </label>
            <select
              value={entityId}
              onChange={(e) => {
                setEntityId(e.target.value);
                setShowPreview(false);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{entityLabel} Seçin</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name || emptyLabel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setShowPreview(false);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setShowPreview(false);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button
              onClick={handlePreview}
              disabled={!isFormValid}
              loading={previewLoading}
            >
              <Eye size={18} className="mr-2" />
              Önizle
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownload}
              disabled={!isFormValid}
              loading={downloadLoading}
            >
              <Download size={18} className="mr-2" />
              İndir
            </Button>
          </div>
        </div>
      </div>

      {showPreview && previewLoading && (
        <div className="flex justify-center py-8">
          <Loading />
        </div>
      )}

      {showPreview && previewData && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="text-green-600" size={24} />
              <div>
                <h2 className="font-semibold text-gray-900">
                  {previewData.entity.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatDate(previewData.startDate)} -{' '}
                  {formatDate(previewData.endDate)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Devir Bakiye</p>
              <p
                className={`font-semibold ${
                  previewData.openingBalance >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {formatCurrency(previewData.openingBalance)}
              </p>
            </div>
          </div>

          {previewData.rows.length > 0 ? (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Hesap</TableHeader>
                    <TableHeader>Tarih</TableHeader>
                    <TableHeader>Açıklama</TableHeader>
                    <TableHeader className="text-right">Borç</TableHeader>
                    <TableHeader className="text-right">Alacak</TableHeader>
                    <TableHeader className="text-right">Bakiye</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{previewData.entity.name}</TableCell>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell className="text-right">
                        {row.borc > 0 ? formatCurrency(row.borc) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.alacak > 0 ? formatCurrency(row.alacak) : '-'}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          row.bakiye >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatCurrency(row.bakiye)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                <span className="font-semibold text-gray-900">
                  Kapanış Bakiye
                </span>
                <span
                  className={`text-lg font-bold ${
                    previewData.closingBalance >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(previewData.closingBalance)}
                </span>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                Bu tarih aralığında işlem bulunamadı.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EkstrePage;
