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
import { Link } from 'react-router-dom';
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

  const timetableData = [
    { time: '07:00', title: '메이크업 샵 도착', category: '메이크업' },
    { time: '10:00', title: '메이크업 아웃 & 웨딩홀 이동', category: '이동' },
    { time: '11:00', title: '웨딩홀 도착 & 리허설', category: '웨딩홀' },
    { time: '11:30', title: '신부대기실 입장', category: '웨딩홀' },
    { time: '12:30', title: '본식 시작', category: '본식' },
    { time: '13:20', title: '원판 사진 촬영', category: '촬영' },
    { time: '13:40', title: '연회장 이동 및 인사', category: '피로연' },
    { time: '15:00', title: '정산 및 마무리', category: '정산' },
  ];

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">예식 당일 타임테이블 (예시)</h2>
                <button className="text-sm text-blush-500 hover:text-blush-600 font-medium">
                  + 일정 추가
                </button>
              </div>
              
              <div className="relative border-l-2 border-blush-200 ml-3 space-y-8 py-2">
                {timetableData.map((item, index) => (
                  <div key={index} className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-blush-400"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span className="font-bold text-blush-500 w-16">{item.time}</span>
                      <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-blush-200 transition-colors">
                        <h3 className="font-medium text-gray-800">{item.title}</h3>
                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 mt-1 inline-block">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-blush-50 border-blush-100">
              <h3 className="font-bold text-gray-800 mb-2">💡 타임테이블 팁</h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>이동 시간은 여유 있게 30분 정도 더 잡아주세요.</li>
                <li>식사 시간은 하객들이 몰리는 시간을 고려하세요.</li>
                <li>가방순이 친구에게는 별도의 시간표를 전달해주세요.</li>
              </ul>
            </div>

            {datedQuotes.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-800 mb-3">📍 예정된 웨딩홀 방문</h3>
                <div className="space-y-2">
                  {datedQuotes.map(quote => {
                    const venue = getVenueById(quote.venueId);
                    return (
                      <button
                        key={quote.id}
                        onClick={() => handleQuoteClick(quote)}
                        className="w-full text-left p-3 bg-gradient-to-r from-ivory-50 to-blush-50 rounded-lg border border-blush-100 hover:border-blush-300 transition-colors"
                        data-testid={`sidebar-quote-${quote.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-blush-500" />
                          <span className="font-medium text-gray-800">{venue?.name || '웨딩홀'}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {quote.date && format(parseISO(quote.date), 'M월 d일 (EEE)', { locale: ko })}
                          {quote.time && ` ${quote.time}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
