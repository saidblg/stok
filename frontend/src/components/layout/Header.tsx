import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../ui/Badge';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 lg:flex-none">
        <h1 className="hidden md:block text-lg font-bold text-gray-900">
        </h1>
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
