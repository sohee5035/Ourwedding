import { Link, useLocation } from 'wouter';
import {
  FaListUl,
  FaCheckSquare,
  FaMoneyBillWave,
  FaUsers,
  FaHeart,
  FaCalendarAlt,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

const Navigation = () => {
  const [location] = useLocation();
  const { logout } = useAuthStore();

  const navItems = [
    { path: '/', icon: FaHeart, label: '홈' },
    { path: '/calendar', icon: FaCalendarAlt, label: '달력' },
    { path: '/venues', icon: FaListUl, label: '웨딩홀' },
    { path: '/checklist', icon: FaCheckSquare, label: '체크' },
    { path: '/budget', icon: FaMoneyBillWave, label: '예산' },
    { path: '/guests', icon: FaUsers, label: '하객' },
  ];

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout();
    }
  };

  return (
    <>
      {/* 데스크톱 상단 네비게이션 */}
      <nav className="hidden md:block bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-blush-100 p-2 rounded-full group-hover:bg-blush-200 transition-colors">
                <FaHeart className="text-blush-400 text-xl" />
              </div>
              <span className="text-2xl font-serif font-bold text-gray-800 tracking-tight">Our Wedding</span>
            </Link>

            <div className="flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
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
              <div className="border-l border-gray-200 h-8 mx-2"></div>
              
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                title="로그아웃"
                data-testid="button-logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 모바일 상단 헤더 */}
      <div className="md:hidden bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/20">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blush-100 p-1.5 rounded-full">
              <FaHeart className="text-blush-400 text-lg" />
            </div>
            <span className="text-lg font-serif font-bold text-gray-800">Our Wedding</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 p-2"
            data-testid="button-logout-mobile"
          >
            <FaSignOutAlt className="text-sm" />
          </button>
        </div>
      </div>

      {/* 모바일 하단 고정 네비게이션 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-50 border-t border-gray-200">
        <div className="flex justify-around items-center px-2 py-2 safe-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                data-testid={`nav-${item.label}`}
                className={`flex flex-col items-center justify-center min-w-[60px] py-2 px-1 rounded-lg transition-all ${
                  isActive 
                    ? 'text-blush-500' 
                    : 'text-gray-500 active:bg-gray-50'
                }`}
              >
                <Icon className={`text-xl mb-0.5 ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
