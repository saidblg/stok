import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../hooks/useTheme';

const AppToaster = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#132238' : '#363636',
          color: '#fff',
          border: isDark ? '1px solid rgba(148, 163, 184, 0.18)' : 'none',
          boxShadow: isDark
            ? '0 18px 50px rgba(2, 6, 23, 0.35)'
            : '0 10px 30px rgba(0, 0, 0, 0.2)',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default AppToaster;
