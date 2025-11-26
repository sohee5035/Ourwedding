import { Link, useLocation } from 'react-router-dom';
import {
  FaMapMarkedAlt,
  FaListUl,
  FaCheckSquare,
  FaMoneyBillWave,
  FaUsers,
  FaHeart
} from 'react-icons/fa';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FaHeart, label: '홈' },
    { path: '/map', icon: FaMapMarkedAlt, label: '지도' },
    { path: '/venues', icon: FaListUl, label: '웨딩홀' },
    { path: '/checklist', icon: FaCheckSquare, label: '체크리스트' },
    { path: '/budget', icon: FaMoneyBillWave, label: '예산' },
    { path: '/guests', icon: FaUsers, label: '하객' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FaHeart className="text-blush-400 text-2xl" />
            <span className="text-xl font-bold text-blush-400">Our Wedding</span>
          </Link>

          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blush-100 text-blush-600'
                      : 'text-gray-600 hover:bg-blush-50 hover:text-blush-500'
                  }`}
                >
                  <Icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 모바일 네비게이션 */}
        <div className="md:hidden flex justify-around py-2 border-t border-gray-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg ${
                  isActive ? 'text-blush-500' : 'text-gray-500'
                }`}
              >
                <Icon className="text-xl" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
