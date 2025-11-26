import { Link, useLocation } from 'react-router-dom';
import {
  FaMapMarkedAlt,
  FaListUl,
  FaCheckSquare,
  FaMoneyBillWave,
  FaUsers,
  FaHeart,
  FaCalendarAlt
} from 'react-icons/fa';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FaHeart, label: '홈' },
    { path: '/calendar', icon: FaCalendarAlt, label: '달력/일정' },
    { path: '/map', icon: FaMapMarkedAlt, label: '지도' },
    { path: '/venues', icon: FaListUl, label: '웨딩홀' },
    { path: '/checklist', icon: FaCheckSquare, label: '체크리스트' },
    { path: '/budget', icon: FaMoneyBillWave, label: '예산' },
    { path: '/guests', icon: FaUsers, label: '하객' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-blush-100 p-2 rounded-full group-hover:bg-blush-200 transition-colors">
              <FaHeart className="text-blush-400 text-xl" />
            </div>
            <span className="text-2xl font-serif font-bold text-gray-800 tracking-tight">Our Wedding</span>
          </Link>

          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-blush-50 text-blush-600 font-semibold shadow-sm ring-1 ring-blush-100'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-blush-500'
                  }`}
                >
                  <Icon className={`text-lg ${isActive ? 'text-blush-500' : 'text-gray-400'}`} />
                  <span className="text-sm">{item.label}</span>
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
