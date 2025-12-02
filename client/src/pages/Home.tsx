import { useWeddingInfoStore } from '../store/weddingInfoStore';
import { useNotesStore } from '../store/notesStore';
import { useAuthStore } from '../store/authStore';
import { FaHeart, FaEdit, FaPaperPlane, FaTrash, FaCopy, FaCheck, FaPen, FaSignInAlt } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useLocation } from 'wouter';

const Home = () => {
  const weddingInfo = useWeddingInfoStore();
  const { notes, fetchNotes, addNote, updateNote, deleteNote, isLoading } = useNotesStore();
  const { member, couple, partner } = useAuthStore();
  const [, setLocation] = useLocation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    weddingDate: weddingInfo.weddingDate || '',
    totalBudget: weddingInfo.totalBudget || 0,
  });
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

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

  const handleHeaderCardClick = () => {
    if (!member) {
      setShowLoginPopup(true);
      return;
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!member) {
      setShowLoginPopup(true);
      return;
    }
    await weddingInfo.updateInfo(formData);
    setIsEditing(false);
  };

  const handleGoToLogin = () => {
    setShowLoginPopup(false);
    setLocation('/auth');
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

  const handleStartEdit = (note: { id: string; content: string }) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingNoteId || !editingNoteContent.trim()) return;
    await updateNote(editingNoteId, editingNoteContent.trim());
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingNoteId) return;
    await deleteNote(deletingNoteId);
    setDeletingNoteId(null);
  };

  const isMyNote = (author: string) => {
    return author === member?.name;
  };

  return (
    <div className={`flex flex-col ${notes.length > 0 ? 'min-h-[calc(100vh-140px)]' : ''}`}>
      {!isEditing ? (
        <div 
          className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blush-100 to-lavender-100 rounded-xl mb-2 cursor-pointer"
          onClick={handleHeaderCardClick}
          data-testid="header-card"
        >
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-gray-800">
                {groomName && brideName
                  ? `${groomName} ❤️ ${brideName}`
                  : groomName || brideName
                    ? `${groomName || brideName}의 결혼 준비`
                    : '우리의 결혼을 준비해요'}
              </h1>
              {formData.weddingDate ? (
                <p className="text-xs text-gray-600">
                  {format(new Date(formData.weddingDate), 'yyyy년 M월 d일', { locale: ko })}
                </p>
              ) : (
                <p className="text-xs text-gray-400">여기를 눌러서 결혼식 날짜를 등록해주세요!</p>
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

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-gray-800">공유 메모</h2>
        <span className="text-xs text-gray-500">{member?.name}으로 작성</span>
      </div>

      <div className={`${notes.length > 0 ? 'flex-1 overflow-y-auto' : ''} space-y-2 pr-1 mb-2`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-3">
            <p className="text-gray-500 text-sm">메모를 불러오는 중...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <FaHeart className="text-2xl text-blush-300 mb-1" />
            <p className="text-gray-500 text-sm">아직 메모가 없어요</p>
            <p className="text-xs text-gray-400">결혼 준비하면서 이야기를 나눠보세요!</p>
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
                    ? 'bg-gray-100 rounded-br-sm'
                    : 'bg-gray-50 rounded-bl-sm border border-gray-100'
                }`}
              >
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full p-2 rounded-lg border border-gray-300 text-sm text-gray-800 resize-none"
                      value={editingNoteContent}
                      onChange={(e) => setEditingNoteContent(e.target.value)}
                      rows={3}
                      autoFocus
                      data-testid={`textarea-edit-note-${note.id}`}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="text-xs px-3 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                        data-testid={`button-cancel-edit-${note.id}`}
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="text-xs px-3 py-1 rounded bg-blush-500 text-white hover:bg-blush-600"
                        data-testid={`button-save-edit-${note.id}`}
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <p className="text-xs text-gray-500">
                        {note.createdAt && format(new Date(note.createdAt), 'M/d a h:mm', { locale: ko })}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          data-testid={`button-edit-note-${note.id}`}
                        >
                          <FaPen className="text-xs" />
                        </button>
                        <button
                          onClick={() => setDeletingNoteId(note.id)}
                          className="text-gray-400 hover:text-blush-500 transition-colors"
                          data-testid={`button-delete-note-${note.id}`}
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="h-16" />
      
      <form onSubmit={handleSubmitNote} className="fixed bottom-0 left-0 right-0 flex gap-2 items-end p-4 bg-ivory-50 border-t border-gray-100 md:static md:border-0 md:p-0 md:bg-transparent md:mt-auto">
        <textarea
          className="input-field flex-1 resize-none min-h-[44px] max-h-[120px]"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (noteContent.trim()) {
                handleSubmitNote(e);
              }
            }
          }}
          placeholder="메모를 입력하세요... (Shift+Enter로 줄바꿈)"
          rows={1}
          data-testid="input-note-content"
        />
        <button
          type="submit"
          className="btn-primary px-4 h-[44px]"
          disabled={!noteContent.trim()}
          data-testid="button-send-note"
        >
          <FaPaperPlane />
        </button>
      </form>

      {deletingNoteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-2">메모 삭제</h3>
            <p className="text-gray-600 mb-6">이 메모를 삭제하시겠어요?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingNoteId(null)}
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                data-testid="button-cancel-delete"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-lg bg-blush-400 text-white hover:bg-blush-500 transition-colors"
                data-testid="button-confirm-delete"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blush-100 rounded-full flex items-center justify-center">
                <FaSignInAlt className="text-2xl text-blush-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">로그인이 필요해요</h3>
            <p className="text-gray-600 mb-6 text-center text-sm">
              결혼식 정보를 저장하려면 먼저 로그인해 주세요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                data-testid="button-cancel-login"
              >
                취소
              </button>
              <button
                onClick={handleGoToLogin}
                className="flex-1 py-2 rounded-lg bg-blush-400 text-white hover:bg-blush-500 transition-colors"
                data-testid="button-go-to-login"
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
