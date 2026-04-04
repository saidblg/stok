import { useState, useEffect } from 'react';
import { Customer } from '../types';
import { useCustomers } from '../hooks/useCustomers';
import CustomerForm from '../components/customers/CustomerForm';
import CustomerList from '../components/customers/CustomerList';
import CustomerDetailModal from '../components/customers/CustomerDetailModal';
import Loading from '../components/ui/Loading';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import { Search, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const PAGE_SIZE = 10;

const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useCustomers({
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCustomer(null);
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h1>
        <p className="text-gray-600 mt-1">
          Müşterilerinizi ekleyin, borç/alacak takibi yapın
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setIsCreateFormOpen((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Plus size={16} className="text-blue-600" />
            Yeni Müşteri
          </span>
          {isCreateFormOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isCreateFormOpen && (
          <div className="border-t border-gray-100 p-4">
            <CustomerForm onSuccess={() => setIsCreateFormOpen(false)} />
          </div>
        )}
      </div>

      <div>
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder="Müşteri ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <CustomerList
          customers={data?.data || []}
          onCustomerClick={handleCustomerClick}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={data?.total || 0}
          itemsPerPage={PAGE_SIZE}
        />
      </div>

      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default CustomersPage;
