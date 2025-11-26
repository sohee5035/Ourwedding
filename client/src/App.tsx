import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Map from './pages/Map';
import Venues from './pages/Venues';
import VenueForm from './pages/VenueForm';
import Calendar from './pages/Calendar';
import Budget from './pages/Budget';
import Guests from './pages/Guests';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="map" element={<Map />} />
          <Route path="venues" element={<Venues />} />
          <Route path="venues/add" element={<VenueForm />} />
          <Route path="venues/edit/:id" element={<VenueForm />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="checklist" element={<Checklist />} />
          <Route path="budget" element={<Budget />} />
          <Route path="guests" element={<Guests />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
