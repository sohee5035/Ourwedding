import { useState, useEffect, useMemo } from 'react';
import { useVenueStore } from '../store/venueStore';
import { Link } from 'wouter';
import { FaPlus, FaMapMarkerAlt, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaSubway, FaCalendar, FaClock, FaList, FaMap, FaTimes, FaBuilding } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { VenueQuote, WeddingVenue } from '../types';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
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

interface QuoteWithVenue extends VenueQuote {
  venue: WeddingVenue;
}

interface DateGroup {
  date: string;
  formattedDate: string;
  quotes: QuoteWithVenue[];
}

const Venues = () => {
  const { venues, venueQuotes, deleteVenue, deleteVenueQuote, fetchVenues, fetchVenueQuotes, getVenuesWithQuotes, getQuotesByVenueId, getVenueById } = useVenueStore();
  const [sortBy, setSortBy] = useState<'name' | 'quotes' | 'recent'>('recent');
  const [expandedVenues, setExpandedVenues] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'date'>('list');

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
      const venueWithCoords = venues.find(v => v.lat && v.lng);
      if (venueWithCoords && venueWithCoords.lat && venueWithCoords.lng) {
        setMapCenter([venueWithCoords.lat, venueWithCoords.lng]);
        setMapZoom(10);
      }
    }
  }, [venues, mapCenter]);

  const venuesWithQuotes = getVenuesWithQuotes();

  const sortedVenues = [...venuesWithQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'quotes':
        return b.quotes.length - a.quotes.length;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const toggleVenue = (venueId: string) => {
    setExpandedVenues((prev) => {
      const next = new Set(prev);
      if (next.has(venueId)) {
        next.delete(venueId);
      } else {
        next.add(venueId);
      }
      return next;
    });
  };

  const handleDeleteVenue = (id: string, name: string) => {
    if (window.confirm(`"${name}" 웨딩홀과 모든 견적을 삭제하시겠습니까?`)) {
      deleteVenue(id);
    }
  };

  const handleDeleteQuote = (quoteId: string, venueName: string) => {
    if (window.confirm(`"${venueName}" 견적을 삭제하시겠습니까?`)) {
      deleteVenueQuote(quoteId);
    }
  };

  const handleMarkerClick = (venue: WeddingVenue) => {
    setSelectedVenue(venue);
    setSelectedQuotes(getQuotesByVenueId(venue.id));
    if (venue.lat && venue.lng) {
      setMapCenter([venue.lat, venue.lng]);
      setMapZoom(14);
    }
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

  const quotesGroupedByDate = useMemo((): DateGroup[] => {
    const quotesWithDates = venueQuotes.filter(q => q.date);
    const dateMap = new Map<string, QuoteWithVenue[]>();
    
    quotesWithDates.forEach(quote => {
      const venue = getVenueById(quote.venueId);
      if (!venue) return;
      
      const dateKey = quote.date!;
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push({ ...quote, venue });
    });
    
    const groups: DateGroup[] = [];
    dateMap.forEach((quotes, date) => {
      let formattedDate = date;
      try {
        formattedDate = format(parseISO(date), 'M월 d일 (EEE)', { locale: ko });
      } catch {
        formattedDate = date;
      }
      groups.push({
        date,
        formattedDate,
        quotes: quotes.sort((a, b) => {
          if (a.time && b.time) return a.time.localeCompare(b.time);
          if (a.time) return -1;
          if (b.time) return 1;
          return 0;
        }),
      });
    });
    
    return groups.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [venueQuotes, getVenueById]);

  const quotesWithoutDate = useMemo((): QuoteWithVenue[] => {
    return venueQuotes
      .filter(q => !q.date)
      .map(quote => {
        const venue = getVenueById(quote.venueId);
        if (!venue) return null;
        return { ...quote, venue };
      })
      .filter((q): q is QuoteWithVenue => q !== null);
  }, [venueQuotes, getVenueById]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">웨딩홀 리스트</h1>
          <p className="text-sm text-gray-500 mt-1">
            총 {venues.length}개 웨딩홀, {venueQuotes.length}개 견적
          </p>
        </div>
        <Link to="/venues/add" className="btn-primary flex items-center gap-2 shrink-0" data-testid="add-venue-button">
          <FaPlus /> 웨딩홀 추가
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-blush-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid="view-mode-list"
          >
            <FaList className="text-xs" /> 목록
          </button>
          <button
            onClick={() => setViewMode('date')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              viewMode === 'date'
                ? 'bg-white text-blush-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid="view-mode-date"
          >
            <FaCalendar className="text-xs" /> 날짜별
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-white text-blush-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid="view-mode-map"
          >
            <FaMap className="text-xs" /> 지도
          </button>
        </div>
        {viewMode === 'list' && (
          <select
            className="text-sm text-gray-600 bg-transparent border-0 focus:ring-0 pr-6 cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            data-testid="sort-select"
          >
            <option value="recent">최근 등록순</option>
            <option value="name">이름순</option>
            <option value="quotes">견적 많은순</option>
          </select>
        )}
      </div>

      {venues.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">아직 등록된 웨딩홀이 없습니다</p>
          <Link to="/venues/add" className="btn-primary inline-flex items-center gap-2">
            <FaPlus /> 첫 웨딩홀 추가하기
          </Link>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {sortedVenues.map((venue) => {
            const isExpanded = expandedVenues.has(venue.id);
            const lowestQuote = getLowestEstimate(venue.id);
            
            return (
              <div key={venue.id} className="card !p-4" data-testid={`venue-card-${venue.id}`}>
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleVenue(venue.id)}
                >
                  {venue.photos && venue.photos.length > 0 ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={venue.photos[0].url} 
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blush-100 to-lavender-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-blush-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-800 truncate">{venue.name}</h3>
                      <span className="text-xs text-blush-500 bg-blush-50 px-2 py-0.5 rounded-full shrink-0">
                        {venue.quotes.length}개
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="truncate">{venue.address}</span>
                      {venue.nearestStation && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="flex items-center gap-0.5 shrink-0">
                            <FaSubway className="text-blue-500" />
                            {venue.nearestStation}
                          </span>
                        </>
                      )}
                    </div>
                    {lowestQuote && (
                      <p className="text-sm font-semibold text-blush-600 mt-1">
                        {(lowestQuote / 10000).toLocaleString()}만원~
                      </p>
                    )}
                  </div>
                  <span className="p-1 text-gray-400 shrink-0">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {venue.photos && venue.photos.length > 0 && (
                      <div className="mb-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {venue.photos.map((photo, idx) => (
                            <div key={idx} className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                              <img 
                                src={photo.url} 
                                alt={`${venue.name} ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-600">견적 목록</h4>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/venues/${venue.id}/quotes/add`}
                          className="text-sm text-blush-500 hover:text-blush-600 flex items-center gap-1"
                          data-testid={`add-quote-${venue.id}`}
                        >
                          <FaPlus className="text-xs" /> 견적 추가
                        </Link>
                        <Link
                          to={`/venues/edit/${venue.id}`}
                          className="text-sm text-gray-500 hover:text-gray-600 flex items-center gap-1"
                          data-testid={`edit-venue-${venue.id}`}
                        >
                          <FaEdit className="text-xs" /> 웨딩홀 정보 수정
                        </Link>
                        <button
                          onClick={() => handleDeleteVenue(venue.id, venue.name)}
                          className="text-sm text-red-400 hover:text-red-500 flex items-center gap-1"
                          data-testid={`delete-venue-${venue.id}`}
                        >
                          <FaTrash className="text-xs" /> 삭제
                        </button>
                      </div>
                    </div>

                    {venue.quotes.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-400 mb-2">아직 등록된 견적이 없습니다</p>
                        <Link
                          to={`/venues/${venue.id}/quotes/add`}
                          className="text-sm text-blush-500 hover:text-blush-600"
                        >
                          첫 견적 추가하기
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {venue.quotes.map((quote: VenueQuote) => (
                          <QuoteCard
                            key={quote.id}
                            quote={quote}
                            venueName={venue.name}
                            onDelete={() => handleDeleteQuote(quote.id, venue.name)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === 'date' ? (
        <div className="space-y-6">
          {quotesGroupedByDate.length === 0 && quotesWithoutDate.length === 0 ? (
            <div className="card text-center py-12">
              <FaCalendar className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">등록된 견적이 없습니다</p>
              <p className="text-sm text-gray-400">웨딩홀에서 견적을 추가해보세요</p>
            </div>
          ) : (
            <>
              {quotesGroupedByDate.map((group) => (
                <div key={group.date} className="card !p-4" data-testid={`date-group-${group.date}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blush-100 to-lavender-100 rounded-full flex items-center justify-center">
                      <FaCalendar className="text-blush-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{group.formattedDate}</h3>
                      <p className="text-xs text-gray-500">{group.quotes.length}개 견적</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {group.quotes.map((quote) => (
                      <div
                        key={quote.id}
                        className="bg-gradient-to-r from-ivory-50 to-blush-50 rounded-xl p-4 border border-blush-100"
                        data-testid={`date-quote-${quote.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {quote.venue.photos && quote.venue.photos.length > 0 ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={quote.venue.photos[0].url} 
                                  alt={quote.venue.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaBuilding className="text-amber-500" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-800">{quote.venue.name}</h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <FaClock className="text-blush-400" />
                                {quote.time || '시간 미정'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Link
                              to={`/venues/quotes/edit/${quote.id}`}
                              className="p-1.5 text-gray-400 hover:text-gray-600"
                              data-testid={`date-edit-quote-${quote.id}`}
                            >
                              <FaEdit className="text-sm" />
                            </Link>
                            <button
                              onClick={() => handleDeleteQuote(quote.id, quote.venue.name)}
                              className="p-1.5 text-gray-400 hover:text-red-500"
                              data-testid={`date-delete-quote-${quote.id}`}
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 text-center bg-white/80 rounded-lg p-3">
                          <div>
                            <p className="text-xs text-gray-500">견적</p>
                            <p className="font-bold text-blush-600">
                              {((quote.estimate || 0) / 10000).toLocaleString()}만원
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">최소인원</p>
                            <p className="font-semibold text-sm">{quote.minGuests || 0}명</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">식대</p>
                            <p className="font-semibold text-sm">{((quote.mealCost || 0) / 10000).toFixed(0)}만원</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">대관료</p>
                            <p className="font-semibold text-sm">{((quote.rentalFee || 0) / 10000).toFixed(0)}만원</p>
                          </div>
                        </div>
                        
                        {quote.memo && (
                          <p className="mt-2 text-sm text-gray-600 bg-white/50 rounded-lg px-3 py-2">
                            {quote.memo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {quotesWithoutDate.length > 0 && (
                <div className="card !p-4" data-testid="date-group-undated">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <FaCalendar className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-600">날짜 미정</h3>
                      <p className="text-xs text-gray-500">{quotesWithoutDate.length}개 견적</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {quotesWithoutDate.map((quote) => (
                      <div
                        key={quote.id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                        data-testid={`undated-quote-${quote.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {quote.venue.photos && quote.venue.photos.length > 0 ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={quote.venue.photos[0].url} 
                                  alt={quote.venue.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaBuilding className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-700">{quote.venue.name}</h4>
                              <p className="text-xs text-gray-400">날짜를 설정해주세요</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Link
                              to={`/venues/quotes/edit/${quote.id}`}
                              className="p-1.5 text-gray-400 hover:text-gray-600"
                              data-testid={`undated-edit-quote-${quote.id}`}
                            >
                              <FaEdit className="text-sm" />
                            </Link>
                            <button
                              onClick={() => handleDeleteQuote(quote.id, quote.venue.name)}
                              className="p-1.5 text-gray-400 hover:text-red-500"
                              data-testid={`undated-delete-quote-${quote.id}`}
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 text-center bg-white/80 rounded-lg p-3">
                          <div>
                            <p className="text-xs text-gray-500">견적</p>
                            <p className="font-bold text-gray-600">
                              {((quote.estimate || 0) / 10000).toLocaleString()}만원
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">최소인원</p>
                            <p className="font-semibold text-sm">{quote.minGuests || 0}명</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">식대</p>
                            <p className="font-semibold text-sm">{((quote.mealCost || 0) / 10000).toFixed(0)}만원</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">대관료</p>
                            <p className="font-semibold text-sm">{((quote.rentalFee || 0) / 10000).toFixed(0)}만원</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="relative h-[60vh] md:h-[500px] rounded-xl overflow-hidden card p-0">
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
            
            {venues.filter(v => v.lat && v.lng).map((venue) => {
              const lowestEstimate = getLowestEstimate(venue.id);
              return (
                <Marker
                  key={venue.id}
                  position={[venue.lat!, venue.lng!]}
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

          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
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
                        to={`/venues/edit/${selectedVenue.id}`}
                        className="btn-secondary flex-1 flex items-center justify-center gap-2"
                      >
                        <FaEdit /> 정보 수정
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </div>
  );
};

interface QuoteCardProps {
  quote: VenueQuote;
  venueName: string;
  onDelete: () => void;
}

const QuoteCard = ({ quote, venueName, onDelete }: QuoteCardProps) => {
  const formatDate = (date?: string) => {
    if (!date) return '날짜 미정';
    const d = new Date(date);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <div 
      className="bg-gradient-to-br from-ivory-50 to-blush-50 rounded-xl p-4 border border-blush-100"
      data-testid={`quote-card-${quote.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaCalendar className="text-blush-400" />
          <span>{formatDate(quote.date)}</span>
          {quote.time && (
            <>
              <FaClock className="text-blush-400 ml-2" />
              <span>{quote.time}</span>
            </>
          )}
        </div>
        <div className="flex gap-1">
          <Link
            to={`/venues/quotes/edit/${quote.id}`}
            className="p-1 text-gray-400 hover:text-gray-600"
            data-testid={`edit-quote-${quote.id}`}
          >
            <FaEdit className="text-sm" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500"
            data-testid={`delete-quote-${quote.id}`}
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>

      {quote.photos && quote.photos.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {quote.photos.slice(0, 3).map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`${venueName} ${index + 1}`}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          ))}
        </div>
      )}

      <div className="bg-white/80 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 mb-1">견적</p>
        <p className="text-xl font-bold text-blush-600">
          {(quote.estimate || 0).toLocaleString()}원
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-center">
          <p className="text-xs text-gray-500">최소인원</p>
          <p className="font-semibold">{quote.minGuests || 0}명</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">식대</p>
          <p className="font-semibold">{((quote.mealCost || 0) / 10000).toFixed(0)}만원</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">대관료</p>
          <p className="font-semibold">{((quote.rentalFee || 0) / 10000).toFixed(0)}만원</p>
        </div>
      </div>

      {quote.memo && (
        <div className="mt-3 pt-3 border-t border-blush-100">
          <p className="text-xs text-gray-500 mb-1">메모</p>
          <p className="text-sm text-gray-700">{quote.memo}</p>
        </div>
      )}
    </div>
  );
};

export default Venues;
