import { useState, useEffect } from 'react';
import { Supplier } from '../types';
import { useSuppliers } from '../hooks/useSuppliers';
import SupplierForm from '../components/suppliers/SupplierForm';
import SupplierList from '../components/suppliers/SupplierList';
import SupplierDetailModal from '../components/suppliers/SupplierDetailModal';
import Loading from '../components/ui/Loading';
import { Search, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const SuppliersPage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const { data, isLoading } = useSuppliers({ search: debouncedSearch });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tedarikçiler</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setIsCreateFormOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Plus size={16} className="text-teal-600" />
            Yeni Tedarikçi
          </span>
          {isCreateFormOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isCreateFormOpen && (
          <div className="border-t border-gray-100 p-4">
            <SupplierForm onSuccess={() => setIsCreateFormOpen(false)} />
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tedarikçi ara (ad, telefon, e-posta)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <SupplierList
          suppliers={data?.data || []}
          onSupplierClick={handleSupplierClick}
        />
      </div>

      <SupplierDetailModal
        supplier={selectedSupplier}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SuppliersPage;
