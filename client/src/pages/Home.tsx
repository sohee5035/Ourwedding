import { useWeddingInfoStore } from '../store/weddingInfoStore';
import { useNotesStore } from '../store/notesStore';
import { useAuthStore } from '../store/authStore';
import { FaHeart, FaEdit, FaPaperPlane, FaTrash, FaCopy, FaCheck } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const Home = () => {
  const weddingInfo = useWeddingInfoStore();
  const { notes, fetchNotes, addNote, deleteNote, isLoading } = useNotesStore();
  const { member, couple, partner } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    weddingDate: weddingInfo.weddingDate || '',
    totalBudget: weddingInfo.totalBudget || 0,
  });

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
  
  const [noteContent, setNoteContent] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    weddingInfo.fetchInfo();
    fetchNotes();
  }, []);

  useEffect(() => {
    setFormData({
      weddingDate: weddingInfo.weddingDate || '',
      totalBudget: weddingInfo.totalBudget || 0,
    });
  }, [weddingInfo.weddingDate, weddingInfo.totalBudget]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  const daysUntil = weddingInfo.getDaysUntilWedding();

  const handleSave = async () => {
    await weddingInfo.updateInfo(formData);
    setIsEditing(false);
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !member) return;
    
    await addNote({
      author: member.name,
      content: noteContent.trim(),
      coupleId: couple?.id,
      memberId: member.id,
    });
    setNoteContent('');
  };

  const handleCopyCode = async () => {
    if (couple?.inviteCode) {
      await navigator.clipboard.writeText(couple.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getAuthorColor = (name: string) => {
    const colors = [
      'bg-blush-100 text-blush-700',
      'bg-lavender-100 text-lavender-700',
      'bg-gold-100 text-gold-700',
      'bg-rose-100 text-rose-700',
      'bg-purple-100 text-purple-700',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const isMyNote = (author: string) => {
    return author === member?.name;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {!isEditing ? (
        <div 
          className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blush-100 to-lavender-100 rounded-xl mb-4 cursor-pointer"
          onClick={() => setIsEditing(true)}
          data-testid="header-card"
        >
          <div className="flex items-center gap-3">
            <FaHeart className="text-2xl text-blush-400" />
            <div>
              <h1 className="text-base font-bold text-gray-800">
                {groomName && brideName
                  ? `${groomName} ❤️ ${brideName}`
                  : groomName || brideName
                    ? `${groomName || brideName}의 결혼 준비`
                    : '우리의 결혼을 준비해요'}
              </h1>
              {formData.weddingDate && (
                <p className="text-xs text-gray-600">
                  {format(new Date(formData.weddingDate), 'yyyy년 M월 d일', { locale: ko })}
                </p>
              )}
            </div>
          </div>
          {daysUntil !== null && (
            <div className="text-right">
              <p className="text-2xl font-bold text-blush-500">D-{daysUntil}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card mb-4 bg-gradient-to-r from-blush-100 to-lavender-100 border-none">
          <div className="space-y-4 max-w-md mx-auto">
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-gray-800">
                {groomName && brideName
                  ? `${groomName} ❤️ ${brideName}`
                  : groomName || brideName
                    ? `${groomName || brideName}의 결혼 준비`
                    : '우리의 결혼을 준비해요'}
              </h2>
              {!partner && (
                <p className="text-xs text-gray-500 mt-1">상대방이 합류하면 이름이 표시됩니다</p>
              )}
            </div>

            <div>
              <label className="label text-sm">결혼식 날짜</label>
              <input
                type="date"
                className="input-field"
                value={formData.weddingDate}
                onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                data-testid="input-wedding-date"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary flex-1" data-testid="button-save-info">
                저장
              </button>
              <button onClick={() => setIsEditing(false)} className="btn-secondary flex-1" data-testid="button-cancel">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {!partner && couple && (
        <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-700 mb-2">상대방을 초대해주세요!</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white rounded-lg px-4 py-2 text-center font-mono text-xl tracking-widest text-gray-800">
              {couple.inviteCode}
            </div>
            <button
              onClick={handleCopyCode}
              className={`p-3 rounded-lg transition-colors ${
                copied ? 'bg-green-500 text-white' : 'bg-blush-500 text-white hover:bg-blush-600'
              }`}
              data-testid="button-copy-code"
            >
              {copied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">이 코드를 상대방에게 공유해주세요</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">공유 메모</h2>
        <span className="text-xs text-gray-500">{member?.name}으로 작성</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">메모를 불러오는 중...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <FaHeart className="text-4xl text-blush-300 mb-3" />
            <p className="text-gray-500 mb-1">아직 메모가 없어요</p>
            <p className="text-sm text-gray-400">결혼 준비하면서 이야기를 나눠보세요!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`flex ${isMyNote(note.author) ? 'justify-end' : 'justify-start'}`}
              data-testid={`note-item-${note.id}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isMyNote(note.author)
                    ? 'bg-blush-400 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 rounded-bl-sm shadow-sm'
                }`}
              >
                {!isMyNote(note.author) && (
                  <p className={`text-xs font-semibold mb-1 ${getAuthorColor(note.author)} inline-block px-2 py-0.5 rounded-full`}>
                    {note.author}
                  </p>
                )}
                <p className={`text-sm leading-relaxed ${isMyNote(note.author) ? 'text-white' : 'text-gray-800'}`}>
                  {note.content}
                </p>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <p className={`text-xs ${isMyNote(note.author) ? 'text-blush-100' : 'text-gray-400'}`}>
                    {note.createdAt && format(new Date(note.createdAt), 'M/d a h:mm', { locale: ko })}
                  </p>
                  {isMyNote(note.author) && (
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-blush-200 hover:text-white transition-colors"
                      data-testid={`button-delete-note-${note.id}`}
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmitNote} className="flex gap-2 mt-auto">
        <input
          type="text"
          className="input-field flex-1"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="메모를 입력하세요..."
          data-testid="input-note-content"
        />
        <button
          type="submit"
          className="btn-primary px-4"
          disabled={!noteContent.trim()}
          data-testid="button-send-note"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Home;
