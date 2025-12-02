import { useState, useEffect } from 'react';
import { useChecklistStore } from '../store/checklistStore';
import { useCalendarEventStore } from '../store/calendarEventStore';
import { useEventCategoryStore } from '../store/eventCategoryStore';
import { useAuthStore } from '../store/authStore';
import { useLocation } from 'wouter';
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
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaHeart,
  FaCog,
  FaLock,
} from 'react-icons/fa';
import type { CalendarEvent, EventCategory } from '@shared/schema';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const { events, fetchEvents, addEvent, updateEvent, deleteEvent } = useCalendarEventStore();
  const { categories, fetchCategories, addCategory, deleteCategory } = useEventCategoryStore();
  const { member } = useAuthStore();
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'timetable'>('calendar');
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
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    time: '',
    category: '기타',
    memo: '',
  });

  const handleGoToLogin = () => {
    setShowLoginPopup(false);
    setLocation('/auth');
  };

  useEffect(() => {
    fetchItems();
    fetchEvents();
    fetchCategories();
  }, [fetchItems, fetchEvents, fetchCategories]);

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
    return dayEvents;
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
    if (!member) {
      setShowLoginPopup(true);
      return;
    }
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
    if (!member) {
      setShowLoginPopup(true);
      return;
    }
    setEventToDelete(event);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!member) {
      setShowLoginPopup(true);
      return;
    }
    if (eventToDelete) {
      await deleteEvent(eventToDelete.id);
      setIsDeleteConfirmOpen(false);
      setEventToDelete(null);
    }
  };

  const handleAddCategory = async () => {
    if (!member) {
      setShowLoginPopup(true);
      return;
    }
    if (!newCategoryName.trim()) return;
    await addCategory(newCategoryName.trim(), newCategoryColor);
    setNewCategoryName('');
    setNewCategoryColor('pink');
  };

  const handleDeleteCategory = async (id: string) => {
    if (!member) {
      setShowLoginPopup(true);
      return;
    }
    if (id.startsWith('default-')) return;
    await deleteCategory(id);
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      event.date && isSameDay(parseISO(event.date), day)
    );
  };

  const getColorBarsForDay = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    const colors: string[] = [];
    
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

                const dayEvents = getEventsForDay(day);

                return (
                  <div
                    key={day.toString()}
                    onClick={() => {
                      const dayEvs = getEventsForDate(day);
                      if (dayEvs.length > 0) {
                        handleDateClick(day);
                      } else {
                        openAddEventModal(format(day, 'yyyy-MM-dd'));
                      }
                    }}
                    className={`min-h-[70px] bg-white border-b border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 ${
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

                    <div className="flex gap-1 mt-2 flex-wrap justify-center">
                      {dayEvents.slice(0, 4).map(event => {
                        const categoryInfo = getCategoryInfo(event.category);
                        const colorClasses = getColorClasses(categoryInfo.color);
                        return (
                          <button
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); openViewEventModal(event); }}
                            className="hover:scale-110 transition-transform"
                            title={event.title}
                            data-testid={`calendar-event-${event.id}`}
                          >
                            <FaHeart className={`text-xs ${colorClasses.text}`} />
                          </button>
                        );
                      })}
                      {dayEvents.length > 4 && (
                        <span className="text-[10px] text-gray-400 font-medium">+{dayEvents.length - 4}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">다가오는 일정</h3>

            {allUpcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FaCalendarAlt className="text-3xl mx-auto mb-2" />
                <p>예정된 일정이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
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

          {allPastEvents.length > 0 && (
            <div className="card">
              <button
                onClick={() => setIsPastEventsExpanded(!isPastEventsExpanded)}
                className="w-full flex items-center justify-between"
                data-testid="button-toggle-past-events"
              >
                <h3 className="text-lg font-bold text-gray-600">지난 일정</h3>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-sm">{allPastEvents.length}건</span>
                  {isPastEventsExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </button>

              {isPastEventsExpanded && (
                <div className="space-y-3 mt-4 pt-4 border-t">
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
            const dayEvents = getEventsForDate(selectedDate);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    {format(selectedDate, 'M월 d일 (EEE)', { locale: ko })} 일정
                  </DialogTitle>
                  <p className="text-sm text-gray-500">{dayEvents.length}개의 일정이 있습니다</p>
                </DialogHeader>
                <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
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

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="login-popup">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blush-100 mx-auto mb-4">
              <FaLock className="text-2xl text-blush-500" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-800 mb-2">로그인이 필요합니다</h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              일정을 수정하려면<br />로그인해 주세요.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                data-testid="button-popup-cancel"
              >
                취소
              </button>
              <button
                onClick={handleGoToLogin}
                className="flex-1 py-2.5 px-4 rounded-full bg-blush-400 text-white font-medium hover:bg-blush-500 transition-colors"
                data-testid="button-popup-login"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
