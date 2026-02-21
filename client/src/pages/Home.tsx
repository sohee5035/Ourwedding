import { useWeddingInfoStore } from '../store/weddingInfoStore';
import { useGuestStore } from '../store/guestStore';
import { useBudgetStore } from '../store/budgetStore';
import { useChecklistStore } from '../store/checklistStore';
import { useCalendarStore } from '../store/calendarStore';
import { useAuthStore } from '../store/authStore';
import { FaHeart, FaUsers, FaMoneyBillWave, FaCheckSquare, FaCalendarAlt, FaPlus, FaCopy, FaCheck, FaEdit } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useLocation } from 'wouter';

const Home = () => {
  const weddingInfo = useWeddingInfoStore();
  const { guests, fetchGuests, getTotalEstimatedCount } = useGuestStore();
  const { budgetItems, fetchItems: fetchBudgetItems } = useBudgetStore();
  const { checklistItems, fetchItems: fetchChecklistItems } = useChecklistStore();
  const { events, fetchEvents } = useCalendarStore();
  const { member, couple, partner } = useAuthStore();
  const [, setLocation] = useLocation();

  const [copied, setCopied] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDate, setNewDate] = useState(weddingInfo.weddingDate || '');

  useEffect(() => {
    weddingInfo.fetchInfo();
    fetchGuests();
    fetchBudgetItems();
    fetchChecklistItems();
    fetchEvents();
  }, []);

  useEffect(() => {
    setNewDate(weddingInfo.weddingDate || '');
  }, [weddingInfo.weddingDate]);

  const getGroomName = () => {
    if (member?.role === 'groom') return member.name;
    if (partner?.role === 'groom') return partner.name;
    return '';
  };

  const getBrideName = () => {
    if (member?.role === 'bride') return member.name;
    if (partner?.role === 'bride') return partner.name;
    return '';
  };

  const groomName = getGroomName();
  const brideName = getBrideName();

  const daysUntil = weddingInfo.getDaysUntilWedding();

  const totalGuests = getTotalEstimatedCount();
  const attendingGuests = guests.filter(g => g.attendance === 'attending').length;

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budgetAmount, 0);
  const spentBudget = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
  const budgetPercent = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0;

  const completedTasks = checklistItems.filter(item => item.completed).length;
  const totalTasks = checklistItems.length;

  const upcomingEvents = events
    .filter(event => {
      const eventDate = parseISO(event.date);
      return differenceInDays(eventDate, new Date()) >= 0;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const handleCopyCode = async () => {
    if (couple?.inviteCode) {
      await navigator.clipboard.writeText(couple.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveDate = async () => {
    if (newDate) {
      await weddingInfo.updateInfo({ weddingDate: newDate });
    }
    setIsEditingDate(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 헤더: 이름 & D-day */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-warm-100 to-accent-50 rounded-3xl p-8 border border-rose-100 shadow-lg shadow-rose-100/50 animate-scale-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-2">
              {groomName && brideName
                ? `${groomName} ❤ ${brideName}`
                : groomName || brideName
                  ? `${groomName || brideName}의 결혼 준비`
                  : '우리의 결혼을 준비해요'}
            </h1>
            {isEditingDate ? (
              <div className="flex gap-2 items-center mt-4">
                <input
                  type="date"
                  className="input-field max-w-xs"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  data-testid="input-wedding-date"
                />
                <button onClick={handleSaveDate} className="btn-primary px-4 py-2 text-sm">
                  저장
                </button>
                <button onClick={() => setIsEditingDate(false)} className="btn-secondary px-4 py-2 text-sm">
                  취소
                </button>
              </div>
            ) : weddingInfo.weddingDate ? (
              <button
                onClick={() => setIsEditingDate(true)}
                className="flex items-center gap-2 text-neutral-600 hover:text-rose-600 transition-colors mt-2"
              >
                <span className="text-lg">
                  {format(new Date(weddingInfo.weddingDate), 'yyyy년 M월 d일 (eee)', { locale: ko })}
                </span>
                <FaEdit className="text-sm" />
              </button>
            ) : (
              <button
                onClick={() => setIsEditingDate(true)}
                className="text-neutral-500 hover:text-rose-600 transition-colors text-sm mt-2 flex items-center gap-2"
              >
                <FaPlus className="text-xs" />
                결혼식 날짜를 등록해주세요
              </button>
            )}
          </div>

          {daysUntil !== null && (
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg">
              <p className="text-sm text-neutral-600 mb-2 font-medium">D-Day</p>
              <p className="text-6xl font-bold bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent animate-pulse-subtle">
                {daysUntil}
              </p>
              <p className="text-xs text-neutral-500 mt-2">일 남았어요</p>
            </div>
          )}
        </div>
      </div>

      {/* 초대 코드 */}
      {!partner && couple && (
        <div className="bg-accent-50 border-2 border-accent-200 rounded-2xl p-6 animate-slide-down">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-700 mb-3">💌 상대방을 초대해주세요!</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white rounded-xl px-4 py-3 text-center font-mono text-2xl tracking-widest text-gray-800 font-bold border-2 border-accent-300">
                  {couple.inviteCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`p-3 rounded-xl transition-all ${
                    copied ? 'bg-green-500 text-white scale-110' : 'bg-rose-500 text-white hover:bg-rose-600 hover:scale-105'
                  }`}
                  data-testid="button-copy-code"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
              <p className="text-xs text-neutral-600 mt-2">이 코드를 상대방에게 공유해주세요</p>
            </div>
          </div>
        </div>
      )}

      {/* 통계 카드 4개 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setLocation('/guests')}
          className="card text-left hover:scale-105 transition-transform animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <FaUsers className="text-blue-500 text-xl" />
            </div>
            <p className="text-sm font-medium text-neutral-600">하객</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalGuests}</p>
          <p className="text-xs text-neutral-500 mt-1">참석 {attendingGuests}명</p>
        </button>

        <button
          onClick={() => setLocation('/budget')}
          className="card text-left hover:scale-105 transition-transform animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <FaMoneyBillWave className="text-green-500 text-xl" />
            </div>
            <p className="text-sm font-medium text-neutral-600">예산</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{budgetPercent}%</p>
          <p className="text-xs text-neutral-500 mt-1">집행률</p>
        </button>

        <button
          onClick={() => setLocation('/checklist')}
          className="card text-left hover:scale-105 transition-transform animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <FaCheckSquare className="text-rose-500 text-xl" />
            </div>
            <p className="text-sm font-medium text-neutral-600">체크리스트</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{completedTasks}/{totalTasks}</p>
          <p className="text-xs text-neutral-500 mt-1">완료</p>
        </button>

        <button
          onClick={() => setLocation('/calendar')}
          className="card text-left hover:scale-105 transition-transform animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <FaCalendarAlt className="text-purple-500 text-xl" />
            </div>
            <p className="text-sm font-medium text-neutral-600">일정</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{events.length}</p>
          <p className="text-xs text-neutral-500 mt-1">등록됨</p>
        </button>
      </div>

      {/* 다가오는 일정 */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaCalendarAlt className="text-rose-500" />
            다가오는 일정
          </h2>
          <button
            onClick={() => setLocation('/calendar')}
            className="text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            전체보기 →
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="text-4xl text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 mb-2">아직 등록된 일정이 없어요</p>
            <button
              onClick={() => setLocation('/calendar')}
              className="btn-primary mt-4 inline-flex items-center gap-2 text-sm px-4 py-2"
            >
              <FaPlus /> 일정 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-all cursor-pointer animate-slide-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                onClick={() => setLocation('/calendar')}
              >
                <div className="text-center min-w-[60px]">
                  <p className="text-2xl font-bold text-rose-500">
                    {format(parseISO(event.date), 'd')}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {format(parseISO(event.date), 'MMM', { locale: ko })}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{event.title}</p>
                  {event.time && (
                    <p className="text-sm text-neutral-500">{event.time}</p>
                  )}
                  {event.memo && (
                    <p className="text-xs text-neutral-400 mt-1">{event.memo}</p>
                  )}
                </div>
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: event.category || '#C4788A' }}></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 빠른 추가 버튼 */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <h3 className="text-lg font-bold text-gray-800 mb-4">빠른 추가</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setLocation('/guests')}
            className="p-4 rounded-xl border-2 border-neutral-200 hover:border-rose-300 hover:bg-rose-50 transition-all text-center group"
          >
            <FaUsers className="text-2xl text-neutral-400 group-hover:text-rose-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-neutral-700 group-hover:text-rose-600 transition-colors">하객 추가</p>
          </button>
          <button
            onClick={() => setLocation('/calendar')}
            className="p-4 rounded-xl border-2 border-neutral-200 hover:border-rose-300 hover:bg-rose-50 transition-all text-center group"
          >
            <FaCalendarAlt className="text-2xl text-neutral-400 group-hover:text-rose-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-neutral-700 group-hover:text-rose-600 transition-colors">일정 추가</p>
          </button>
          <button
            onClick={() => setLocation('/checklist')}
            className="p-4 rounded-xl border-2 border-neutral-200 hover:border-rose-300 hover:bg-rose-50 transition-all text-center group"
          >
            <FaCheckSquare className="text-2xl text-neutral-400 group-hover:text-rose-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-neutral-700 group-hover:text-rose-600 transition-colors">할 일 추가</p>
          </button>
          <button
            onClick={() => setLocation('/budget')}
            className="p-4 rounded-xl border-2 border-neutral-200 hover:border-rose-300 hover:bg-rose-50 transition-all text-center group"
          >
            <FaMoneyBillWave className="text-2xl text-neutral-400 group-hover:text-rose-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-neutral-700 group-hover:text-rose-600 transition-colors">예산 추가</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
