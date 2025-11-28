import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FaHeart, FaUserPlus, FaSignInAlt, FaUsers } from 'react-icons/fa';

type AuthMode = 'welcome' | 'register' | 'join' | 'login';

interface InvitePreview {
  valid: boolean;
  assignedRole?: 'bride' | 'groom';
  partnerName?: string;
  error?: string;
}

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState<'bride' | 'groom'>('bride');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitePreview, setInvitePreview] = useState<InvitePreview | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  
  const { register, join, login } = useAuthStore();

  const checkInviteCode = async (code: string) => {
    if (code.length !== 6) {
      setInvitePreview(null);
      return;
    }
    
    setIsCheckingCode(true);
    try {
      const res = await fetch(`/api/auth/invite/${code}`);
      const data = await res.json();
      setInvitePreview(data);
      if (!data.valid && data.error) {
        setError(data.error);
      } else {
        setError('');
      }
    } catch {
      setInvitePreview(null);
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleInviteCodeChange = (value: string) => {
    const code = value.toUpperCase().slice(0, 6);
    setInviteCode(code);
    if (code.length === 6) {
      checkInviteCode(code);
    } else {
      setInvitePreview(null);
      setError('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await register(name, pin, role);
    if (!result.success) {
      setError(result.error || '가입에 실패했습니다');
    }
    setIsSubmitting(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await join(name, pin, inviteCode);
    if (!result.success) {
      setError(result.error || '합류에 실패했습니다');
    }
    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(name, pin);
    if (!result.success) {
      setError(result.error || '로그인에 실패했습니다');
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setName('');
    setPin('');
    setInviteCode('');
    setRole('bride');
    setError('');
    setInvitePreview(null);
  };

  if (mode === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-ivory-50 to-blush-50">
        <div className="text-center mb-8">
          <FaHeart className="text-5xl text-blush-400 mx-auto mb-4" />
          <h1 className="font-serif text-3xl text-gray-800 mb-2">Our Wedding</h1>
          <p className="text-gray-600">함께 준비하는 우리의 결혼</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => { resetForm(); setMode('register'); }}
            className="w-full btn-primary py-4 flex items-center justify-center gap-3"
            data-testid="button-start-register"
          >
            <FaUserPlus className="text-lg" />
            <span>새로 시작하기</span>
          </button>

          <button
            onClick={() => { resetForm(); setMode('join'); }}
            className="w-full btn-secondary py-4 flex items-center justify-center gap-3"
            data-testid="button-start-join"
          >
            <FaUsers className="text-lg" />
            <span>초대 코드로 합류하기</span>
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-ivory-50 to-blush-50 text-gray-500">또는</span>
            </div>
          </div>

          <button
            onClick={() => { resetForm(); setMode('login'); }}
            className="w-full text-blush-600 hover:text-blush-700 py-2 flex items-center justify-center gap-2"
            data-testid="button-start-login"
          >
            <FaSignInAlt />
            <span>이미 계정이 있으신가요?</span>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-ivory-50 to-blush-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <FaHeart className="text-4xl text-blush-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-800 mb-1">새로 시작하기</h2>
            <p className="text-sm text-gray-600">실명과 4자리 비밀번호를 설정해주세요</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">나는 누구인가요?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('groom')}
                  className={`py-4 rounded-xl border-2 transition-all ${
                    role === 'groom'
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                  data-testid="button-role-groom"
                >
                  <span className="text-2xl block mb-1">🤵</span>
                  <span className="font-medium">예비 신랑</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('bride')}
                  className={`py-4 rounded-xl border-2 transition-all ${
                    role === 'bride'
                      ? 'border-pink-400 bg-pink-50 text-pink-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                  data-testid="button-role-bride"
                >
                  <span className="text-2xl block mb-1">👰</span>
                  <span className="font-medium">예비 신부</span>
                </button>
              </div>
            </div>

            <div>
              <label className="label">이름 (실명)</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                data-testid="input-register-name"
              />
            </div>

            <div>
              <label className="label">비밀번호 (4자리 숫자)</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                className="input-field text-center text-2xl tracking-[1em]"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                required
                data-testid="input-register-pin"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-3"
              disabled={isSubmitting || pin.length !== 4}
              data-testid="button-submit-register"
            >
              {isSubmitting ? '가입 중...' : '시작하기'}
            </button>

            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="w-full text-gray-500 hover:text-gray-700 py-2"
              data-testid="button-back-register"
            >
              뒤로 가기
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-ivory-50 to-blush-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <FaUsers className="text-4xl text-blush-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-800 mb-1">초대 코드로 합류하기</h2>
            <p className="text-sm text-gray-600">상대방에게 받은 초대 코드를 입력해주세요</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="label">초대 코드 (6자리)</label>
              <input
                type="text"
                className="input-field text-center text-2xl tracking-[0.5em] uppercase"
                value={inviteCode}
                onChange={(e) => handleInviteCodeChange(e.target.value)}
                placeholder="ABC123"
                maxLength={6}
                required
                data-testid="input-join-code"
              />
              {isCheckingCode && (
                <p className="text-sm text-gray-500 mt-2 text-center">확인 중...</p>
              )}
            </div>

            {invitePreview?.valid && (
              <div className={`p-4 rounded-xl border-2 ${
                invitePreview.assignedRole === 'groom' 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-pink-50 border-pink-200'
              }`}>
                <div className="text-center">
                  <span className="text-3xl block mb-2">
                    {invitePreview.assignedRole === 'groom' ? '🤵' : '👰'}
                  </span>
                  <p className={`font-medium ${
                    invitePreview.assignedRole === 'groom' ? 'text-blue-700' : 'text-pink-700'
                  }`}>
                    {invitePreview.partnerName}님의 
                    {invitePreview.assignedRole === 'groom' ? ' 예비 신랑' : ' 예비 신부'}으로 합류해요
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="label">이름 (실명)</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                data-testid="input-join-name"
              />
            </div>

            <div>
              <label className="label">비밀번호 (4자리 숫자)</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                className="input-field text-center text-2xl tracking-[1em]"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                required
                data-testid="input-join-pin"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-3"
              disabled={isSubmitting || pin.length !== 4 || !invitePreview?.valid}
              data-testid="button-submit-join"
            >
              {isSubmitting ? '합류 중...' : '합류하기'}
            </button>

            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="w-full text-gray-500 hover:text-gray-700 py-2"
              data-testid="button-back-join"
            >
              뒤로 가기
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-ivory-50 to-blush-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <FaSignInAlt className="text-4xl text-blush-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-800 mb-1">로그인</h2>
            <p className="text-sm text-gray-600">이름과 비밀번호를 입력해주세요</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">이름</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                data-testid="input-login-name"
              />
            </div>

            <div>
              <label className="label">비밀번호 (4자리 숫자)</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                className="input-field text-center text-2xl tracking-[1em]"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                required
                data-testid="input-login-pin"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full btn-primary py-3"
              disabled={isSubmitting || pin.length !== 4}
              data-testid="button-submit-login"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>

            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="w-full text-gray-500 hover:text-gray-700 py-2"
              data-testid="button-back-login"
            >
              뒤로 가기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default Auth;
