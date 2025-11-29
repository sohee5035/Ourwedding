import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-ivory-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:py-8 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
