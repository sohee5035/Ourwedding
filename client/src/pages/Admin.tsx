import { useState, useEffect } from 'react';
import { FaLock, FaUsers, FaTrash, FaSignOutAlt, FaUserFriends } from 'react-icons/fa';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CoupleWithMembers {
  id: string;
  inviteCode: string;
  createdAt: string;
  members: {
    id: string;
    name: string;
    createdAt: string;
  }[];
}

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [couples, setCouples] = useState<CoupleWithMembers[]>([]);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/admin/me', { credentials: 'include' });
      const data = await res.json();
      setIsLoggedIn(data.isAdmin);
      if (data.isAdmin) {
        fetchCouples();
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCouples = async () => {
    try {
      const res = await fetch('/api/admin/couples', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCouples(data);
      }
    } catch (error) {
      console.error('Failed to fetch couples:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        setIsLoggedIn(true);
        fetchCouples();
      } else {
        const data = await res.json();
        setError(data.error || '로그인에 실패했습니다');
      }
    } catch (error) {
      setError('로그인에 실패했습니다');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsLoggedIn(false);
      setCouples([]);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleDeleteCouple = async (id: string, members: CoupleWithMembers['members']) => {
    const names = members.map(m => m.name).join(', ') || '멤버 없음';
    if (!confirm(`"${names}" 커플을 삭제하시겠습니까?\n모든 멤버와 데이터가 함께 삭제됩니다.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/couples/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (res.ok) {
        setCouples(couples.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete couple:', error);
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`"${memberName}" 멤버를 삭제하시겠습니까?`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (res.ok) {
        setCouples(couples.map(c => ({
          ...c,
          members: c.members.filter(m => m.id !== memberId),
        })));
      }
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">관리자 로그인</h1>
              <p className="text-gray-500 mt-2">관리자 계정으로 로그인해주세요</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  data-testid="input-admin-password"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                data-testid="button-admin-login"
              >
                로그인
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-800 text-white py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaLock className="text-xl" />
            <h1 className="text-xl font-bold">관리자 대시보드</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            data-testid="button-admin-logout"
          >
            <FaSignOutAlt />
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FaUserFriends className="text-2xl text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-800">가입자 관리</h2>
          </div>
          <p className="text-gray-500">
            총 {couples.length}개 커플, {couples.reduce((acc, c) => acc + c.members.length, 0)}명의 멤버
          </p>
        </div>

        {couples.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">아직 가입한 커플이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {couples.map((couple) => (
              <div
                key={couple.id}
                className="bg-white rounded-xl shadow-sm p-6"
                data-testid={`couple-card-${couple.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-lg font-bold text-gray-800">
                        {couple.inviteCode}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        초대코드
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      생성일: {couple.createdAt 
                        ? format(new Date(couple.createdAt), 'yyyy년 M월 d일 HH:mm', { locale: ko })
                        : '알 수 없음'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCouple(couple.id, couple.members)}
                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="커플 삭제"
                    data-testid={`delete-couple-${couple.id}`}
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    멤버 ({couple.members.length}/2)
                  </p>
                  {couple.members.length === 0 ? (
                    <p className="text-sm text-gray-400">멤버 없음</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {couple.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                          data-testid={`member-card-${member.id}`}
                        >
                          <div>
                            <p className="font-medium text-gray-800">{member.name}</p>
                            <p className="text-xs text-gray-500">
                              {member.createdAt
                                ? format(new Date(member.createdAt), 'M/d HH:mm', { locale: ko })
                                : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="멤버 삭제"
                            data-testid={`delete-member-${member.id}`}
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
