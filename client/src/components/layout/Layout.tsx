import { ReactNode } from 'react';
import { Link } from 'wouter';
import { FaRocket, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import Navigation from './Navigation';
import { useAuthStore } from '../../store/authStore';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated } = useAuthStore();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const showBanner = !isAuthenticated && !bannerDismissed;

  return (
    <div className="min-h-screen bg-ivory-50">
      <Navigation />

      {/* 게스트 모드 배너 */}
      {showBanner && (
        <div className="bg-gradient-to-r from-blush-500 to-purple-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FaRocket className="text-xl flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm md:text-base">결혼 준비를 시작하세요! 🎉</p>
                  <p className="text-xs md:text-sm opacity-90">회원가입하고 모든 기능을 이용해보세요</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="px-4 py-2 bg-white text-blush-500 rounded-lg font-bold text-sm hover:bg-blush-50 transition-colors whitespace-nowrap"
                >
                  Login
                </Link>
                <button
                  onClick={() => setBannerDismissed(true)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="배너 닫기"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:py-8 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
