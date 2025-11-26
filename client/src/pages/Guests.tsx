import { useState } from 'react';
import { useGuestStore } from '../store/guestStore';
import { FaPlus, FaTrash, FaEdit, FaUserTie, FaFemale } from 'react-icons/fa';
import type { Guest } from '../types';

const Guests = () => {
  const { guests, addGuest, updateGuest, deleteGuest, getGuestsBySide, getAttendingCount } =
    useGuestStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterSide, setFilterSide] = useState<'all' | 'groom' | 'bride'>('all');
  const [filterAttendance, setFilterAttendance] = useState<'all' | 'attending' | 'declined' | 'pending'>('all');
  const [formData, setFormData] = useState<Omit<Guest, 'id' | 'createdAt'>>({
    name: '',
    phone: '',
    side: 'groom',
    relation: '',
    invitationSent: false,
    attendance: 'pending',
    tableNumber: undefined,
    memo: '',
  });

  const handleAdd = () => {
    if (!formData.name.trim()) return;

    addGuest(formData);
    resetForm();
  };

  const handleEdit = (id: string) => {
    const guest = guests.find((g) => g.id === id);
    if (guest) {
      setFormData({
        name: guest.name,
        phone: guest.phone,
        side: guest.side,
        relation: guest.relation || '',
        invitationSent: guest.invitationSent,
        attendance: guest.attendance,
        tableNumber: guest.tableNumber,
        memo: guest.memo || '',
      });
      setEditingId(id);
      setShowAddForm(true);
    }
  };

  const handleUpdate = () => {
    if (!editingId || !formData.name.trim()) return;

    updateGuest(editingId, formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      side: 'groom',
      relation: '',
      invitationSent: false,
      attendance: 'pending',
      tableNumber: undefined,
      memo: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const groomGuests = getGuestsBySide('groom');
  const brideGuests = getGuestsBySide('bride');
  const attendingCount = getAttendingCount();

  const filteredGuests = guests.filter((guest) => {
    if (filterSide !== 'all' && guest.side !== filterSide) return false;
    if (filterAttendance !== 'all' && guest.attendance !== filterAttendance) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">하객 관리</h1>
          <p className="text-gray-600 mt-2">총 {guests.length}명 (참석: {attendingCount}명)</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> 하객 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50">
          <div className="flex items-center gap-3">
            <FaUserTie className="text-3xl text-blue-500" />
            <div>
              <h3 className="text-sm text-gray-600">신랑측</h3>
              <p className="text-2xl font-bold text-blue-600">{groomGuests.length}명</p>
            </div>
          </div>
        </div>

        <div className="card bg-pink-50">
          <div className="flex items-center gap-3">
            <FaFemale className="text-3xl text-pink-500" />
            <div>
              <h3 className="text-sm text-gray-600">신부측</h3>
              <p className="text-2xl font-bold text-pink-600">{brideGuests.length}명</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50">
          <h3 className="text-sm text-gray-600 mb-2">참석</h3>
          <p className="text-2xl font-bold text-green-600">
            {guests.filter((g) => g.attendance === 'attending').length}명
          </p>
        </div>

        <div className="card bg-yellow-50">
          <h3 className="text-sm text-gray-600 mb-2">미정</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {guests.filter((g) => g.attendance === 'pending').length}명
          </p>
        </div>
      </div>

      {/* 추가/수정 폼 */}
      {showAddForm && (
        <div className="card bg-blush-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingId ? '하객 정보 수정' : '새 하객 추가'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">이름 *</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="이름"
                />
              </div>

              <div>
                <label className="label">연락처</label>
                <input
                  type="tel"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010-0000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">구분 *</label>
                <select
                  className="input-field"
                  value={formData.side}
                  onChange={(e) =>
                    setFormData({ ...formData, side: e.target.value as 'groom' | 'bride' })
                  }
                >
                  <option value="groom">신랑측</option>
                  <option value="bride">신부측</option>
                </select>
              </div>

              <div>
                <label className="label">관계</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  placeholder="예: 친구, 직장동료, 가족"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">참석 여부</label>
                <select
                  className="input-field"
                  value={formData.attendance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attendance: e.target.value as 'pending' | 'attending' | 'declined',
                    })
                  }
                >
                  <option value="pending">미정</option>
                  <option value="attending">참석</option>
                  <option value="declined">불참</option>
                </select>
              </div>

              <div>
                <label className="label">테이블 번호</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.tableNumber || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tableNumber: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="테이블 번호"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.invitationSent}
                    onChange={(e) =>
                      setFormData({ ...formData, invitationSent: e.target.checked })
                    }
                    className="w-5 h-5 text-blush-500 rounded focus:ring-blush-400"
                  />
                  <span className="text-sm text-gray-700">청첩장 발송</span>
                </label>
              </div>
            </div>

            <div>
              <label className="label">메모</label>
              <textarea
                className="input-field"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="메모 (선택사항)"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="btn-primary flex-1"
              >
                {editingId ? '수정' : '추가'}
              </button>
              <button onClick={resetForm} className="btn-secondary flex-1">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="label">구분 필터</label>
            <select
              className="input-field"
              value={filterSide}
              onChange={(e) => setFilterSide(e.target.value as any)}
            >
              <option value="all">전체</option>
              <option value="groom">신랑측</option>
              <option value="bride">신부측</option>
            </select>
          </div>

          <div>
            <label className="label">참석 필터</label>
            <select
              className="input-field"
              value={filterAttendance}
              onChange={(e) => setFilterAttendance(e.target.value as any)}
            >
              <option value="all">전체</option>
              <option value="attending">참석</option>
              <option value="pending">미정</option>
              <option value="declined">불참</option>
            </select>
          </div>
        </div>
      </div>

      {/* 하객 리스트 */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          하객 목록 ({filteredGuests.length}명)
        </h2>
        {filteredGuests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">조건에 맞는 하객이 없습니다</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">이름</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">연락처</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">구분</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">관계</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">참석</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">테이블</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">청첩장</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-800">{guest.name}</p>
                        {guest.memo && (
                          <p className="text-sm text-gray-500 mt-1">{guest.memo}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{guest.phone}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          guest.side === 'groom'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {guest.side === 'groom' ? '신랑' : '신부'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{guest.relation}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          guest.attendance === 'attending'
                            ? 'bg-green-100 text-green-700'
                            : guest.attendance === 'declined'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {guest.attendance === 'attending'
                          ? '참석'
                          : guest.attendance === 'declined'
                          ? '불참'
                          : '미정'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {guest.tableNumber || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          guest.invitationSent
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {guest.invitationSent ? '발송' : '미발송'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(guest.id)}
                          className="text-blue-500 hover:text-blue-600 p-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteGuest(guest.id)}
                          className="text-red-500 hover:text-red-600 p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guests;
