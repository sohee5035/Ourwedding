import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FaHeart, FaUserPlus, FaSignInAlt, FaUsers } from 'react-icons/fa';

type AuthMode = 'welcome' | 'register' | 'join' | 'login';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, join, login } = useAuthStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await register(name, pin);
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
    setError('');
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
                onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                maxLength={6}
                required
                data-testid="input-join-code"
              />
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
              disabled={isSubmitting || pin.length !== 4 || inviteCode.length !== 6}
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
