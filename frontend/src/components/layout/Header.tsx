import { Menu, LogOut, MoonStar, SunMedium, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Badge from '../ui/Badge';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 lg:flex-none">
        <Link to="/dashboard" className="hidden md:inline-flex items-center" aria-label="Ana Sayfa">
          <img src="/logo.png" alt="Karabacak Gıda" className="h-12 w-auto rounded-md" />
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <Badge variant={user.role === 'ADMIN' ? 'success' : 'default'}>
                {user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
              </Badge>
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-switch"
                aria-label={isDark ? 'Açık moda geç' : 'Koyu moda geç'}
                aria-pressed={isDark}
                title={isDark ? 'Açık moda geç' : 'Koyu moda geç'}
              >
                <span className="theme-switch-track">
                  <SunMedium size={14} className="theme-switch-icon theme-switch-icon-sun" />
                  <MoonStar size={14} className="theme-switch-icon theme-switch-icon-moon" />
                  <span className={`theme-switch-thumb ${isDark ? 'theme-switch-thumb-dark' : ''}`}>
                    {isDark ? <MoonStar size={12} /> : <SunMedium size={12} />}
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Çıkış Yap"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Çıkış</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
