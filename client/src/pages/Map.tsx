import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useVenueStore } from '../store/venueStore';
import { FaMapMarkerAlt, FaTimes, FaSubway, FaEdit, FaList } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import type { WeddingVenue, VenueQuote } from '../types';
import 'leaflet/dist/leaflet.css';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapController({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

const Map = () => {
  const { venues, venueQuotes, fetchVenues, fetchVenueQuotes, getQuotesByVenueId } = useVenueStore();
  const [selectedVenue, setSelectedVenue] = useState<WeddingVenue | null>(null);
  const [selectedQuotes, setSelectedQuotes] = useState<VenueQuote[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState(8);

  useEffect(() => {
    fetchVenues();
    fetchVenueQuotes();
  }, [fetchVenues, fetchVenueQuotes]);

  useEffect(() => {
    if (venues.length > 0 && !mapCenter) {
      setMapCenter([venues[0].lat, venues[0].lng]);
      setMapZoom(10);
    }
  }, [venues, mapCenter]);

  const handleMarkerClick = (venue: WeddingVenue) => {
    setSelectedVenue(venue);
    setSelectedQuotes(getQuotesByVenueId(venue.id));
    setMapCenter([venue.lat, venue.lng]);
    setMapZoom(14);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedVenue(null);
    setSelectedQuotes([]);
  };

  const defaultCenter: [number, number] = [37.5665, 126.978];

  const getLowestEstimate = (venueId: string): number | null => {
    if (!venueQuotes || venueQuotes.length === 0) return null;
    const quotes = venueQuotes.filter(q => q.venueId === venueId);
    if (quotes.length === 0) return null;
    const estimates = quotes.map(q => q.estimate ?? 0).filter(e => e > 0);
    if (estimates.length === 0) return null;
    return Math.min(...estimates);
  };

  return (
    <div className="relative h-[70vh] md:h-[600px] rounded-xl overflow-hidden">
      {venues.length === 0 ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center p-6">
            <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">등록된 웨딩홀이 없습니다</p>
            <Link to="/venues/add" className="btn-primary inline-block">
              웨딩홀 추가하기
            </Link>
          </div>
        </div>
      ) : (
        <>
          <MapContainer
            center={mapCenter || defaultCenter}
            zoom={mapZoom}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={mapCenter} zoom={mapZoom} />
            
            {venues.map((venue) => {
              const lowestEstimate = getLowestEstimate(venue.id);
              return (
                <Marker
                  key={venue.id}
                  position={[venue.lat, venue.lng]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => handleMarkerClick(venue),
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{venue.name}</strong>
                      {lowestEstimate !== null && (
                        <>
                          <br />
                          <span className="text-blush-500">
                            {lowestEstimate.toLocaleString()}원~
                          </span>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          <div className="absolute top-4 left-4 right-4 z-[1000]">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaMapMarkerAlt className="text-blush-500" />
                <span>웨딩홀 {venues.length}곳</span>
                <span className="text-gray-400">|</span>
                <span className="text-xs">핀을 터치해서 상세정보 확인</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-[1000] md:left-auto md:right-4 md:w-80">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-2 flex gap-2 overflow-x-auto">
              {venues.map((venue) => (
                <button
                  key={venue.id}
                  onClick={() => handleMarkerClick(venue)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedVenue?.id === venue.id
                      ? 'bg-blush-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`venue-chip-${venue.id}`}
                >
                  {venue.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={(open) => {
        setIsDrawerOpen(open);
        if (!open) {
          setSelectedVenue(null);
          setSelectedQuotes([]);
        }
      }}>
        <DrawerContent className="max-h-[85vh]">
          {selectedVenue && (
            <div className="overflow-y-auto">
              <DrawerHeader className="text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <DrawerTitle className="text-xl">{selectedVenue.name}</DrawerTitle>
                    <DrawerDescription className="mt-1">
                      {selectedVenue.address}
                    </DrawerDescription>
                  </div>
                  <button
                    onClick={handleDrawerClose}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              </DrawerHeader>

              <div className="px-4 pb-6 space-y-4">
                {selectedVenue.nearestStation && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaSubway className="text-blue-500" />
                    <span>{selectedVenue.nearestStation}</span>
                  </div>
                )}

                {selectedQuotes.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-600">
                      등록된 견적 {selectedQuotes.length}개
                    </p>
                    {selectedQuotes.map((quote) => (
                      <div 
                        key={quote.id} 
                        className="bg-gradient-to-br from-ivory-50 to-blush-50 rounded-xl p-4 border border-blush-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm text-gray-500">
                            {quote.date ? new Date(quote.date).toLocaleDateString('ko-KR') : '날짜 미정'}
                            {quote.time && ` ${quote.time}`}
                          </div>
                          <Link
                            to={`/venues/quotes/edit/${quote.id}`}
                            className="text-xs text-blush-500 hover:text-blush-600"
                          >
                            수정
                          </Link>
                        </div>
                        <p className="text-xl font-bold text-blush-600">
                          {(quote.estimate || 0).toLocaleString()}원
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-500">
                          <span>최소 {quote.minGuests || 0}명</span>
                          <span>식대 {((quote.mealCost || 0) / 10000).toFixed(0)}만원</span>
                          <span>대관 {((quote.rentalFee || 0) / 10000).toFixed(0)}만원</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-400 mb-2">아직 등록된 견적이 없습니다</p>
                    <Link
                      to={`/venues/${selectedVenue.id}/quotes/add`}
                      className="text-sm text-blush-500 hover:text-blush-600"
                    >
                      첫 견적 추가하기
                    </Link>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link
                    to={`/venues/${selectedVenue.id}/quotes/add`}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    + 견적 추가
                  </Link>
                  <Link
                    to="/venues"
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <FaList /> 전체 목록
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Map;
