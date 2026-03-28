import { useEffect, useMemo, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionList from '../components/transactions/TransactionList';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';

const PAGE_SIZE = 30;

const TransactionsPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTransactions({ page, limit: PAGE_SIZE });

  const transactions = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visiblePages = useMemo(() => {
    let start = Math.max(page - 2, 1);
    let end = Math.min(start + 4, totalPages);
    start = Math.max(end - 4, 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tüm İşlemler</h1>
        <p className="mt-1 text-gray-600">
          Tüm zamanlar kayıtları listelenir. Sayfa başına {PAGE_SIZE} işlem gösterilir.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Toplam <span className="font-semibold text-gray-900">{total}</span> işlem
          </p>
          <p className="text-sm text-gray-600">
            Sayfa <span className="font-semibold text-gray-900">{page}</span> / {totalPages}
          </p>
        </div>

        <TransactionList
          transactions={transactions}
          onDelete={() => undefined}
          showDelete={false}
          showDescription={false}
        />

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
          >
            Önceki
          </Button>

          <div className="flex items-center gap-2">
            {visiblePages.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium ${
                  pageNumber === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
