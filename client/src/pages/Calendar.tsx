import { useState, useEffect } from 'react';
import { useChecklistStore } from '../store/checklistStore';
import { useVenueStore } from '../store/venueStore';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaList, FaMapMarkerAlt, FaTimes, FaUsers, FaUtensils, FaBuilding } from 'react-icons/fa';
import { Link } from 'wouter';
import type { VenueQuote, WeddingVenue } from '../types';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

interface QuoteWithVenue extends VenueQuote {
  venue?: WeddingVenue;
}

const Calendar = () => {
  const { items, fetchItems } = useChecklistStore();
  const { venues, venueQuotes, fetchVenues, fetchVenueQuotes, getVenueById } = useVenueStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'timetable'>('calendar');
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithVenue | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchVenues();
    fetchVenueQuotes();
  }, [fetchItems, fetchVenues, fetchVenueQuotes]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const datedItems = items.filter(item => item.date);

  const datedQuotes = venueQuotes.filter(quote => quote.date);

  const handleQuoteClick = (quote: VenueQuote) => {
    const venue = getVenueById(quote.venueId);
    setSelectedQuote({ ...quote, venue: venue || undefined });
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedQuote(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">일정 캘린더</h1>
          <p className="text-gray-600 mt-2">결혼 준비 주요 일정을 확인하세요</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'calendar' 
                ? 'bg-white text-blush-500 shadow-sm font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid="button-calendar-view"
          >
            <FaCalendarAlt /> 달력
          </button>
          <button
            onClick={() => setViewMode('timetable')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              viewMode === 'timetable' 
                ? 'bg-white text-blush-500 shadow-sm font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            data-testid="button-timetable-view"
          >
            <FaList /> 타임테이블
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 flex justify-between items-center bg-blush-50 border-b border-blush-100">
            <button onClick={prevMonth} className="p-2 hover:bg-blush-100 rounded-full text-blush-600" data-testid="button-prev-month">
              <FaChevronLeft />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h2>
            <div className="flex gap-2">
              <button onClick={today} className="px-3 py-1 text-sm bg-white border border-blush-200 rounded-full text-blush-600 hover:bg-blush-50" data-testid="button-today">
                오늘
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-blush-100 rounded-full text-blush-600" data-testid="button-next-month">
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 bg-white border-b border-gray-100">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div 
                key={day} 
                className={`py-3 text-center text-sm font-medium ${
                  i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-gray-50">
            {calendarDays.map((day) => {
              const isSelectedMonth = isSameMonth(day, monthStart);
              const isTodayDate = isSameDay(day, new Date());
              
              const dayItems = datedItems.filter(item => 
                item.date && isSameDay(parseISO(item.date), day)
              );

              const dayQuotes = datedQuotes.filter(quote =>
                quote.date && isSameDay(parseISO(quote.date), day)
              );

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[100px] bg-white border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 ${
                    !isSelectedMonth ? 'bg-gray-50/50' : ''
                  }`}
                  data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        isTodayDate
                          ? 'bg-blush-500 text-white'
                          : !isSelectedMonth
                          ? 'text-gray-400'
                          : 'text-gray-700'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {dayQuotes.map(quote => {
                      const venue = getVenueById(quote.venueId);
                      return (
                        <button
                          key={quote.id}
                          onClick={() => handleQuoteClick(quote)}
                          className="w-full text-left text-xs px-2 py-1 rounded bg-gradient-to-r from-gold-100 to-blush-100 text-gold-700 truncate hover:from-gold-200 hover:to-blush-200 transition-colors flex items-center gap-1"
                          title={venue?.name || '웨딩홀'}
                          data-testid={`quote-event-${quote.id}`}
                        >
                          <FaMapMarkerAlt className="text-blush-500 flex-shrink-0" />
                          <span className="truncate">{venue?.name || '웨딩홀'}</span>
                          {quote.time && (
                            <span className="text-gold-500 flex-shrink-0 ml-auto">{quote.time}</span>
                          )}
                        </button>
                      );
                    })}
                    {dayItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`text-xs px-2 py-1 rounded truncate ${
                          item.completed 
                            ? 'bg-gray-100 text-gray-400 line-through' 
                            : 'bg-blush-100 text-blush-700'
                        }`}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-blush-100 rounded-full flex items-center justify-center mb-4">
            <FaList className="text-2xl text-blush-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">준비중입니다</h2>
          <p className="text-gray-500 text-center">
            예식 당일 타임테이블 기능을<br />열심히 준비하고 있어요!
          </p>
        </div>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={(open) => {
        setIsDrawerOpen(open);
        if (!open) setSelectedQuote(null);
      }}>
        <DrawerContent className="max-h-[85vh]">
          {selectedQuote && (
            <div className="overflow-y-auto">
              <DrawerHeader className="text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <DrawerTitle className="text-xl flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blush-500" />
                      {selectedQuote.venue?.name || '웨딩홀'}
                    </DrawerTitle>
                    <DrawerDescription className="mt-1">
                      {selectedQuote.venue?.address || '주소 정보 없음'}
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
                <div className="bg-gradient-to-r from-gold-50 to-blush-50 rounded-xl p-4 border border-gold-100">
                  <div className="flex items-center gap-2 text-gold-700 font-medium mb-2">
                    <FaCalendarAlt />
                    예식 일정
                  </div>
                  <p className="text-xl font-bold text-gray-800">
                    {selectedQuote.date 
                      ? format(parseISO(selectedQuote.date), 'yyyy년 M월 d일 (EEE)', { locale: ko })
                      : '날짜 미정'}
                    {selectedQuote.time && ` ${selectedQuote.time}`}
                  </p>
                </div>

                <div className="bg-blush-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">견적</p>
                  <p className="text-2xl font-bold text-blush-600">
                    {(selectedQuote.estimate || 0).toLocaleString()}원
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <FaUsers className="text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">최소인원</p>
                    <p className="font-semibold">{selectedQuote.minGuests || 0}명</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <FaUtensils className="text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">식대</p>
                    <p className="font-semibold text-sm">{((selectedQuote.mealCost || 0) / 10000).toFixed(0)}만원</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <FaBuilding className="text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">대관료</p>
                    <p className="font-semibold text-sm">{((selectedQuote.rentalFee || 0) / 10000).toFixed(0)}만원</p>
                  </div>
                </div>

                {selectedQuote.photos && selectedQuote.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedQuote.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`${selectedQuote.venue?.name || '웨딩홀'} ${index + 1}`}
                        className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                )}

                {selectedQuote.memo && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm text-gray-500 mb-1">메모</p>
                    <p className="text-gray-700">{selectedQuote.memo}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link
                    to={`/venues/quotes/edit/${selectedQuote.id}`}
                    className="btn-primary flex-1 text-center"
                    onClick={handleDrawerClose}
                  >
                    견적 수정
                  </Link>
                  <Link
                    to="/venues"
                    className="btn-secondary flex-1 text-center"
                    onClick={handleDrawerClose}
                  >
                    웨딩홀 목록
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

export default Calendar;
