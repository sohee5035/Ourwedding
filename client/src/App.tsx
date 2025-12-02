import { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Venues from './pages/Venues';
import VenueForm from './pages/VenueForm';
import QuoteForm from './pages/QuoteForm';
import Calendar from './pages/Calendar';
import Checklist from './pages/Checklist';
import Budget from './pages/Budget';
import Guests from './pages/Guests';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import { useAuthStore } from './store/authStore';

function App() {
  const { isLoading, checkAuth } = useAuthStore();
  const [location] = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  if (location === '/admin') {
    return <Admin />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory-50 to-blush-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blush-300 border-t-blush-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/venues" component={Venues} />
        <Route path="/venues/add" component={VenueForm} />
        <Route path="/venues/edit/:id" component={VenueForm} />
        <Route path="/venues/:venueId/quotes/add" component={QuoteForm} />
        <Route path="/venues/quotes/edit/:quoteId" component={QuoteForm} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/checklist" component={Checklist} />
        <Route path="/budget" component={Budget} />
        <Route path="/guests" component={Guests} />
      </Switch>
    </Layout>
  );
}

export default App;
