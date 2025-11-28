import { useState, useEffect } from 'react';
import { useChecklistStore } from '../store/checklistStore';
import { useVenueStore } from '../store/venueStore';
import { useCalendarEventStore } from '../store/calendarEventStore';
import { useEventCategoryStore } from '../store/eventCategoryStore';
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
  parseISO,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaCalendarAlt, 
  FaList, 
  FaTimes, 
  FaUsers, 
  FaUtensils, 
  FaBuilding,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaHeart,
  FaCog,
} from 'react-icons/fa';
import { Link } from 'wouter';
import type { VenueQuote, WeddingVenue } from '../types';
import type { CalendarEvent, EventCategory } from '@shared/schema';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface QuoteWithVenue extends VenueQuote {
  venue?: WeddingVenue;
}

const COLOR_PALETTE = [
  { name: 'pink', bg: 'bg-pink-400', bgLight: 'bg-pink-50', text: 'text-pink-500' },
  { name: 'rose', bg: 'bg-rose-400', bgLight: 'bg-rose-50', text: 'text-rose-500' },
  { name: 'red', bg: 'bg-red-400', bgLight: 'bg-red-50', text: 'text-red-500' },
  { name: 'orange', bg: 'bg-orange-400', bgLight: 'bg-orange-50', text: 'text-orange-500' },
  { name: 'amber', bg: 'bg-amber-400', bgLight: 'bg-amber-50', text: 'text-amber-500' },
  { name: 'yellow', bg: 'bg-yellow-400', bgLight: 'bg-yellow-50', text: 'text-yellow-500' },
  { name: 'lime', bg: 'bg-lime-400', bgLight: 'bg-lime-50', text: 'text-lime-500' },
  { name: 'green', bg: 'bg-green-400', bgLight: 'bg-green-50', text: 'text-green-500' },
  { name: 'emerald', bg: 'bg-emerald-400', bgLight: 'bg-emerald-50', text: 'text-emerald-500' },
  { name: 'teal', bg: 'bg-teal-400', bgLight: 'bg-teal-50', text: 'text-teal-500' },
  { name: 'cyan', bg: 'bg-cyan-400', bgLight: 'bg-cyan-50', text: 'text-cyan-500' },
  { name: 'sky', bg: 'bg-sky-400', bgLight: 'bg-sky-50', text: 'text-sky-500' },
  { name: 'blue', bg: 'bg-blue-400', bgLight: 'bg-blue-50', text: 'text-blue-500' },
  { name: 'indigo', bg: 'bg-indigo-400', bgLight: 'bg-indigo-50', text: 'text-indigo-500' },
  { name: 'violet', bg: 'bg-violet-400', bgLight: 'bg-violet-50', text: 'text-violet-500' },
  { name: 'purple', bg: 'bg-purple-400', bgLight: 'bg-purple-50', text: 'text-purple-500' },
  { name: 'fuchsia', bg: 'bg-fuchsia-400', bgLight: 'bg-fuchsia-50', text: 'text-fuchsia-500' },
  { name: 'gray', bg: 'bg-gray-400', bgLight: 'bg-gray-50', text: 'text-gray-500' },
];

const DEFAULT_CATEGORIES = [
  { name: '예식장 방문', color: 'pink' },
  { name: '상견례', color: 'purple' },
  { name: '가족 식사', color: 'orange' },
  { name: '드레스 투어', color: 'rose' },
  { name: '가전가구 상담', color: 'teal' },
  { name: '기타', color: 'gray' },
];

const getColorClasses = (colorName: string) => {
  const color = COLOR_PALETTE.find(c => c.name === colorName);
  return color || COLOR_PALETTE[0];
};

const Calendar = () => {
  const { items, fetchItems } = useChecklistStore();
  const { venues, venueQuotes, fetchVenues, fetchVenueQuotes, getVenueById } = useVenueStore();
  const { events, fetchEvents, addEvent, updateEvent, deleteEvent } = useCalendarEventStore();
  const { categories, fetchCategories, addCategory, deleteCategory } = useEventCategoryStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'timetable'>('calendar');
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithVenue | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('pink');
  const [viewingEvent, setViewingEvent] = useState<CalendarEvent | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPastEventsExpanded, setIsPastEventsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDateEventsModalOpen, setIsDateEventsModalOpen] = useState(false);
  const [viewingSource, setViewingSource] = useState<'date-modal' | null>(null);
  
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    category: '기타',
    memo: '',
  });

  useEffect(() => {
    fetchItems();
    fetchVenues();
    fetchVenueQuotes();
    fetchEvents();
    fetchCategories();
  }, [fetchItems, fetchVenues, fetchVenueQuotes, fetchEvents, fetchCategories]);

  const defaultCats = DEFAULT_CATEGORIES.map((cat, i) => ({ 
    id: `default-${i}`, 
    name: cat.name, 
    color: cat.color, 
    coupleId: '',
    createdAt: new Date()
  }));
  
  const allCategories = [...defaultCats, ...categories];

  const getCategoryInfo = (categoryName: string): { name: string; color: string } => {
    const found = allCategories.find(c => c.name === categoryName);
    if (found) return { name: found.name, color: found.color };
    return { name: categoryName, color: 'gray' };
  };

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

  const openAddEventModal = (date?: string) => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      date: date || format(new Date(), 'yyyy-MM-dd'),
      time: '',
      category: '기타',
      memo: '',
    });
    setIsEventModalOpen(true);
  };

  const openViewEventModal = (event: CalendarEvent, source: 'date-modal' | null = null) => {
    setViewingSource(source);
    setViewingEvent(event);
    setIsViewModalOpen(true);
  };

  const handleBackToDateModal = () => {
    setIsViewModalOpen(false);
    setViewingEvent(null);
    setViewingSource(null);
    setIsDateEventsModalOpen(true);
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsDateEventsModalOpen(true);
  };

  const getEventsForDate = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter(event => event.date === dateStr);
    const dayQuotes = venueQuotes.filter(quote => quote.date === dateStr);
    return { events: dayEvents, quotes: dayQuotes };
  };

  const openEditEventModal = (event: CalendarEvent) => {
    setIsViewModalOpen(false);
    setViewingEvent(null);
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      time: event.time || '',
      category: event.category,
      memo: event.memo || '',
    });
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async () => {
    if (!eventForm.title.trim() || !eventForm.date) return;

    if (editingEvent) {
      await updateEvent(editingEvent.id, {
        title: eventForm.title,
        date: eventForm.date,
        time: eventForm.time || null,
        category: eventForm.category,
        memo: eventForm.memo || null,
      });
    } else {
      await addEvent({
        title: eventForm.title,
        date: eventForm.date,
        time: eventForm.time || null,
        category: eventForm.category,
        memo: eventForm.memo || null,
      });
    }
    setIsEventModalOpen(false);
  };

  const confirmDeleteEvent = (event: CalendarEvent) => {
    setEventToDelete(event);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      await deleteEvent(eventToDelete.id);
      setIsDeleteConfirmOpen(false);
      setEventToDelete(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await addCategory(newCategoryName.trim(), newCategoryColor);
    setNewCategoryName('');
    setNewCategoryColor('pink');
  };

  const handleDeleteCategory = async (id: string) => {
    if (id.startsWith('default-')) return;
    await deleteCategory(id);
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      event.date && isSameDay(parseISO(event.date), day)
    );
  };

  const getQuotesForDay = (day: Date) => {
    return datedQuotes.filter(quote =>
      quote.date && isSameDay(parseISO(quote.date), day)
    );
  };

  const getColorBarsForDay = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const dayQuotes = getQuotesForDay(day);
    const colors: string[] = [];
    
    dayQuotes.forEach(() => {
      colors.push('bg-amber-400');
    });
    
    dayEvents.forEach(event => {
      const categoryInfo = getCategoryInfo(event.category);
      const colorClasses = getColorClasses(categoryInfo.color);
      colors.push(colorClasses.bg);
    });
    
    return colors.slice(0, 4);
  };

  const allUpcomingEvents = [...events]
    .filter(e => {
      if (!e.date) return false;
      const eventDate = parseISO(e.date);
      return isAfter(eventDate, new Date()) || isSameDay(eventDate, new Date());
    })
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });

  const allUpcomingQuotes = [...datedQuotes]
    .filter(q => {
      if (!q.date) return false;
      const quoteDate = parseISO(q.date);
      return isAfter(quoteDate, new Date()) || isSameDay(quoteDate, new Date());
    })
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });

  const todayDate = startOfDay(new Date());
  
  const allPastEvents = [...events]
    .filter(e => {
      if (!e.date) return false;
      const eventDate = parseISO(e.date);
      return isBefore(eventDate, todayDate);
    })
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

  const allPastQuotes = [...datedQuotes]
    .filter(q => {
      if (!q.date) return false;
      const quoteDate = parseISO(q.date);
      return isBefore(quoteDate, todayDate);
    })
    .sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">일정 캘린더</h1>
          <p className="text-gray-600 text-sm">결혼 준비 주요 일정을 확인하세요</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            data-testid="button-manage-categories"
            title="카테고리"
          >
            <FaCog className="text-base" />
          </button>
          <button
            onClick={() => openAddEventModal()}
            className="w-9 h-9 rounded-full bg-blush-400 text-white flex items-center justify-center shadow-md hover:bg-blush-500 transition-colors"
            data-testid="button-add-event"
            title="일정 추가"
          >
            <FaPlus className="text-base" />
          </button>
          <div className="flex bg-gray-100 p-0.5 rounded-full">
            <button
              onClick={() => setViewMode('calendar')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                viewMode === 'calendar' 
                  ? 'bg-white text-blush-500 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              data-testid="button-calendar-view"
              title="달력"
            >
              <FaCalendarAlt className="text-base" />
            </button>
            <button
              onClick={() => setViewMode('timetable')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                viewMode === 'timetable' 
                  ? 'bg-white text-blush-500 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              data-testid="button-timetable-view"
              title="타임테이블"
            >
              <FaList className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          <div className="card p-0 overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-blush-50 border-b border-blush-100">
              <button onClick={prevMonth} className="p-2 hover:bg-blush-100 rounded-full text-blush-600" data-testid="button-prev-month">
                <FaChevronLeft />
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-800">
                  {format(currentDate, 'yyyy년 M월', { locale: ko })}
                </h2>
                <button 
                  onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                  className="p-1.5 hover:bg-blush-100 rounded-full text-blush-500"
                  data-testid="button-toggle-calendar"
                >
                  {isCalendarExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
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

            <div className={`grid grid-cols-7 bg-gray-50 transition-all duration-300 ${isCalendarExpanded ? '' : 'max-h-[200px] overflow-hidden'}`}>
              {calendarDays.map((day) => {
                const isSelectedMonth = isSameMonth(day, monthStart);
                const isTodayDate = isSameDay(day, new Date());
                
                const dayItems = datedItems.filter(item => 
                  item.date && isSameDay(parseISO(item.date), day)
                );

                const dayQuotes = getQuotesForDay(day);
                const dayEvents = getEventsForDay(day);
                const colorBars = getColorBarsForDay(day);

                return (
                  <div
                    key={day.toString()}
                    onClick={() => {
                      const { events: dayEvs, quotes: dayQts } = getEventsForDate(day);
                      if (dayEvs.length > 0 || dayQts.length > 0) {
                        handleDateClick(day);
                      } else if (!isCalendarExpanded) {
                        openAddEventModal(format(day, 'yyyy-MM-dd'));
                      }
                    }}
                    className={`${isCalendarExpanded ? 'min-h-[100px]' : 'min-h-[50px]'} bg-white border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 ${
                      !isSelectedMonth ? 'bg-gray-50/50' : ''
                    } cursor-pointer`}
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
                    
                    {isCalendarExpanded ? (
                      <div className="mt-2 space-y-1">
                        {dayQuotes.map(quote => {
                          const venue = getVenueById(quote.venueId);
                          return (
                            <button
                              key={quote.id}
                              onClick={(e) => { e.stopPropagation(); handleQuoteClick(quote); }}
                              className="w-full text-left text-xs px-2 py-1 rounded bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 truncate hover:from-amber-200 hover:to-amber-100 transition-colors flex items-center gap-1"
                              title={venue?.name || '웨딩홀'}
                              data-testid={`quote-event-${quote.id}`}
                            >
                              <FaBuilding className="text-amber-500 flex-shrink-0" />
                              <span className="truncate">{venue?.name || '웨딩홀'}</span>
                              {quote.time && (
                                <span className="text-amber-500 flex-shrink-0 ml-auto">{quote.time}</span>
                              )}
                            </button>
                          );
                        })}
                        {dayEvents.map(event => {
                          const categoryInfo = getCategoryInfo(event.category);
                          const colorClasses = getColorClasses(categoryInfo.color);
                          return (
                            <button
                              key={event.id}
                              onClick={(e) => { e.stopPropagation(); openViewEventModal(event); }}
                              className={`w-full text-left text-xs px-2 py-1 rounded truncate flex items-center gap-1 ${colorClasses.bgLight} hover:opacity-80 transition-colors`}
                              title={event.title}
                              data-testid={`calendar-event-${event.id}`}
                            >
                              <FaHeart className={`flex-shrink-0 ${colorClasses.text}`} />
                              <span className="truncate text-gray-700">{event.title}</span>
                              {event.time && (
                                <span className="text-gray-500 flex-shrink-0 ml-auto">{event.time}</span>
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
                    ) : (
                      <div className="flex gap-0.5 mt-1">
                        {colorBars.map((color, idx) => (
                          <div key={idx} className={`h-1.5 flex-1 rounded-full ${color}`} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">다가오는 일정</h3>

            {allUpcomingQuotes.length === 0 && allUpcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaCalendarAlt className="text-3xl mx-auto mb-2" />
                <p>예정된 일정이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allUpcomingQuotes.map(quote => {
                  const venue = getVenueById(quote.venueId);
                  return (
                    <button
                      key={`quote-${quote.id}`}
                      onClick={() => handleQuoteClick(quote)}
                      className="w-full flex items-center gap-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-left"
                      data-testid={`upcoming-quote-${quote.id}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
                        <FaBuilding className="text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{venue?.name || '웨딩홀 견적'}</p>
                        <p className="text-sm text-gray-500">
                          {quote.date ? format(parseISO(quote.date), 'M월 d일 (EEE)', { locale: ko }) : '날짜 미정'}
                          {quote.time && ` ${quote.time}`}
                        </p>
                      </div>
                      <div className="text-amber-600 font-semibold text-sm">
                        {((quote.estimate || 0) / 10000).toLocaleString()}만원
                      </div>
                    </button>
                  );
                })}
                
                {allUpcomingEvents.map(event => {
                  const categoryInfo = getCategoryInfo(event.category);
                  const colorClasses = getColorClasses(categoryInfo.color);
                  return (
                    <button
                      key={`event-${event.id}`}
                      onClick={() => openViewEventModal(event)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl ${colorClasses.bgLight} hover:opacity-80 transition-colors text-left`}
                      data-testid={`upcoming-event-${event.id}`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${colorClasses.bg} bg-opacity-30 flex items-center justify-center`}>
                        <FaHeart className={colorClasses.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{event.title}</p>
                        <p className="text-sm text-gray-500">
                          {format(parseISO(event.date), 'M월 d일 (EEE)', { locale: ko })}
                          {event.time && ` ${event.time}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {(allPastEvents.length > 0 || allPastQuotes.length > 0) && (
            <div className="card">
              <button
                onClick={() => setIsPastEventsExpanded(!isPastEventsExpanded)}
                className="w-full flex items-center justify-between"
                data-testid="button-toggle-past-events"
              >
                <h3 className="text-lg font-bold text-gray-600">지난 일정</h3>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-sm">{allPastEvents.length + allPastQuotes.length}건</span>
                  {isPastEventsExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </button>

              {isPastEventsExpanded && (
                <div className="space-y-3 mt-4 pt-4 border-t">
                  {allPastQuotes.map(quote => {
                    const venue = getVenueById(quote.venueId);
                    return (
                      <button
                        key={`past-quote-${quote.id}`}
                        onClick={() => handleQuoteClick(quote)}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left opacity-70"
                        data-testid={`past-quote-${quote.id}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <FaBuilding className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-600 truncate">{venue?.name || '웨딩홀 견적'}</p>
                          <p className="text-sm text-gray-400">
                            {quote.date ? format(parseISO(quote.date), 'M월 d일 (EEE)', { locale: ko }) : '날짜 미정'}
                            {quote.time && ` ${quote.time}`}
                          </p>
                        </div>
                        <div className="text-gray-500 font-semibold text-sm">
                          {((quote.estimate || 0) / 10000).toLocaleString()}만원
                        </div>
                      </button>
                    );
                  })}
                  
                  {allPastEvents.map(event => {
                    const categoryInfo = getCategoryInfo(event.category);
                    const colorClasses = getColorClasses(categoryInfo.color);
                    return (
                      <button
                        key={`past-event-${event.id}`}
                        onClick={() => openViewEventModal(event)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left opacity-70"
                        data-testid={`past-event-${event.id}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                          <FaHeart className={colorClasses.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-600 truncate">{event.title}</p>
                          <p className="text-sm text-gray-400">
                            {format(parseISO(event.date), 'M월 d일 (EEE)', { locale: ko })}
                            {event.time && ` ${event.time}`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
                      <FaBuilding className="text-amber-500" />
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
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
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

                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">견적</p>
                  <p className="text-2xl font-bold text-amber-600">
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

      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? '일정 수정' : '새 일정 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">일정 제목</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="일정 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blush-300 focus:border-blush-400"
                data-testid="input-event-title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                {allCategories.map(cat => {
                  const colorClasses = getColorClasses(cat.color);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEventForm({ ...eventForm, category: cat.name })}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors ${
                        eventForm.category === cat.name
                          ? `${colorClasses.bg} bg-opacity-20 border-current`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`button-category-${cat.name}`}
                    >
                      <FaHeart className={colorClasses.text} />
                      <span className="text-xs text-gray-600 truncate max-w-full">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blush-300 focus:border-blush-400"
                  data-testid="input-event-date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시간 (선택)</label>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blush-300 focus:border-blush-400"
                  data-testid="input-event-time"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
              <textarea
                value={eventForm.memo}
                onChange={(e) => setEventForm({ ...eventForm, memo: e.target.value })}
                placeholder="메모를 입력하세요"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blush-300 focus:border-blush-400 resize-none"
                data-testid="input-event-memo"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="btn-secondary flex-1"
                data-testid="button-cancel-event"
              >
                취소
              </button>
              <button
                onClick={handleEventSubmit}
                disabled={!eventForm.title.trim() || !eventForm.date}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-save-event"
              >
                {editingEvent ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>일정 삭제</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 text-center">
              "{eventToDelete?.title}" 일정을<br />삭제하시겠습니까?
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="flex-1 py-3 px-6 border border-gray-200 text-gray-600 rounded-full font-medium hover:bg-gray-50 transition-colors"
              data-testid="button-cancel-delete"
            >
              취소
            </button>
            <button
              onClick={handleDeleteEvent}
              className="flex-1 py-3 px-6 bg-red-100 text-red-500 rounded-full font-medium hover:bg-red-200 transition-colors"
              data-testid="button-confirm-delete"
            >
              삭제
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="!w-auto !max-w-none p-5">
          <div className="w-[260px]">
            <DialogHeader className="text-left p-0 mb-3">
              <DialogTitle className="text-base">카테고리 관리</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">새 카테고리 추가</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="카테고리 이름"
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blush-300 focus:border-blush-400"
                    data-testid="input-new-category-name"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="btn-primary px-3 py-2 disabled:opacity-50 shrink-0"
                    data-testid="button-add-category"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">색상 선택</label>
                <div className="grid grid-cols-6 gap-3">
                  {COLOR_PALETTE.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setNewCategoryColor(color.name)}
                      className={`w-8 h-8 rounded-full ${color.bg} flex items-center justify-center transition-transform ${
                        newCategoryColor === color.name ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-105'
                      }`}
                      data-testid={`button-color-${color.name}`}
                    >
                      {newCategoryColor === color.name && (
                        <FaHeart className="text-white text-[10px]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">현재 카테고리</label>
                <div className="space-y-1 max-h-[140px] overflow-y-auto">
                  {allCategories.map(cat => {
                    const colorClasses = getColorClasses(cat.color);
                    const isDefault = cat.id.startsWith('default-');
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg gap-1"
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <div className={`w-5 h-5 rounded-full ${colorClasses.bg} flex items-center justify-center shrink-0`}>
                            <FaHeart className="text-white text-[8px]" />
                          </div>
                          <span className="text-xs text-gray-700 truncate">{cat.name}</span>
                          {isDefault && (
                            <span className="text-[10px] text-gray-400 shrink-0">(기본)</span>
                          )}
                        </div>
                        {!isDefault && (
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-white shrink-0"
                            data-testid={`button-delete-category-${cat.id}`}
                          >
                            <FaTrash className="text-[10px]" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="btn-primary text-sm px-4 py-1.5"
                  data-testid="button-close-category-modal"
                >
                  완료
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={(open) => {
          if (!open) {
            setViewingSource(null);
          }
          setIsViewModalOpen(open);
        }}>
        <DialogContent className="sm:max-w-md">
          {viewingEvent && (() => {
            const categoryInfo = getCategoryInfo(viewingEvent.category);
            const colorClasses = getColorClasses(categoryInfo.color);
            return (
              <>
                {viewingSource === 'date-modal' && (
                  <button
                    onClick={handleBackToDateModal}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2 -mt-2"
                    data-testid="button-back-to-date-modal"
                  >
                    <FaChevronLeft className="text-xs" />
                    <span>목록으로</span>
                  </button>
                )}
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} bg-opacity-30 flex items-center justify-center`}>
                      <FaHeart className={`text-xl ${colorClasses.text}`} />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{viewingEvent.title}</DialogTitle>
                      <p className={`text-sm ${colorClasses.text}`}>{viewingEvent.category}</p>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className={`${colorClasses.bgLight} rounded-xl p-4`}>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <FaCalendarAlt className={colorClasses.text} />
                      <span className="font-medium">일정</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {format(parseISO(viewingEvent.date), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                      {viewingEvent.time && (
                        <span className="ml-2 font-normal text-gray-600">{viewingEvent.time}</span>
                      )}
                    </p>
                  </div>

                  {viewingEvent.memo && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">메모</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{viewingEvent.memo}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      onClick={() => openEditEventModal(viewingEvent)}
                      className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      data-testid="button-view-edit"
                    >
                      <FaEdit /> 수정
                    </button>
                    <button
                      onClick={() => {
                        setIsViewModalOpen(false);
                        confirmDeleteEvent(viewingEvent);
                      }}
                      className="flex-1 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      data-testid="button-view-delete"
                    >
                      <FaTrash /> 삭제
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={isDateEventsModalOpen} onOpenChange={setIsDateEventsModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedDate && (() => {
            const { events: dayEvents, quotes: dayQuotes } = getEventsForDate(selectedDate);
            const totalCount = dayEvents.length + dayQuotes.length;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {format(selectedDate, 'M월 d일 (EEE)', { locale: ko })} 일정
                  </DialogTitle>
                  <p className="text-sm text-gray-500">{totalCount}개의 일정이 있습니다</p>
                </DialogHeader>
                <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
                  {dayQuotes.map(quote => {
                    const venue = getVenueById(quote.venueId);
                    return (
                      <button
                        key={`quote-${quote.id}`}
                        onClick={() => {
                          setIsDateEventsModalOpen(false);
                          handleQuoteClick(quote);
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-left"
                        data-testid={`date-modal-quote-${quote.id}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center shrink-0">
                          <FaBuilding className="text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{venue?.name || '웨딩홀 견적'}</p>
                          <p className="text-sm text-gray-500">
                            {quote.time || '시간 미정'}
                          </p>
                        </div>
                        <div className="text-amber-600 font-semibold text-sm shrink-0">
                          {((quote.estimate || 0) / 10000).toLocaleString()}만원
                        </div>
                      </button>
                    );
                  })}
                  {dayEvents.map(event => {
                    const categoryInfo = getCategoryInfo(event.category);
                    const colorClasses = getColorClasses(categoryInfo.color);
                    return (
                      <button
                        key={`event-${event.id}`}
                        onClick={() => {
                          setIsDateEventsModalOpen(false);
                          openViewEventModal(event, 'date-modal');
                        }}
                        className={`w-full flex items-center gap-3 p-3 ${colorClasses.bgLight} rounded-xl hover:opacity-80 transition-colors text-left`}
                        data-testid={`date-modal-event-${event.id}`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${colorClasses.bg} bg-opacity-30 flex items-center justify-center shrink-0`}>
                          <FaHeart className={colorClasses.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {event.time || '시간 미정'} · {event.category}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => {
                      setIsDateEventsModalOpen(false);
                      openAddEventModal(format(selectedDate, 'yyyy-MM-dd'));
                    }}
                    className="flex-1 py-3 px-4 bg-blush-400 text-white rounded-xl font-medium hover:bg-blush-500 transition-colors flex items-center justify-center gap-2"
                    data-testid="button-add-event-from-date"
                  >
                    <FaPlus /> 일정 추가
                  </button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
