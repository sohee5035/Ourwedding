import { useState, useEffect } from 'react';
import { useGuestStore } from '../store/guestStore';
import { useAuthStore } from '../store/authStore';
import { FaPlus, FaTrash, FaEdit, FaHeart, FaRegHeart, FaTable } from 'react-icons/fa';
import type { Guest } from '../types';

interface BulkGuestRow {
  name: string;
  phone: string;
  relation: string;
}

const Guests = () => {
  const { guests, addGuest, updateGuest, deleteGuest, getGuestsBySide, getAttendingCount, fetchGuests } =
    useGuestStore();
  const { member } = useAuthStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
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

  const [bulkSide, setBulkSide] = useState<'groom' | 'bride'>('groom');

  const defaultSide = member?.role === 'bride' ? 'bride' : 'groom';

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  useEffect(() => {
    if (member?.role) {
      const side = member.role === 'bride' ? 'bride' : 'groom';
      setFormData(prev => ({ ...prev, side }));
      setBulkSide(side);
    }
  }, [member?.role]);
  const [bulkRows, setBulkRows] = useState<BulkGuestRow[]>([
    { name: '', phone: '', relation: '' },
    { name: '', phone: '', relation: '' },
    { name: '', phone: '', relation: '' },
    { name: '', phone: '', relation: '' },
    { name: '', phone: '', relation: '' },
  ]);

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
      setShowBulkForm(false);
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
      side: defaultSide,
      relation: '',
      invitationSent: false,
      attendance: 'pending',
      tableNumber: undefined,
      memo: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const updateBulkRow = (index: number, field: keyof BulkGuestRow, value: string) => {
    const newRows = [...bulkRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setBulkRows(newRows);
  };

  const addBulkRow = () => {
    setBulkRows([...bulkRows, { name: '', phone: '', relation: '' }]);
  };

  const removeBulkRow = (index: number) => {
    if (bulkRows.length > 1) {
      setBulkRows(bulkRows.filter((_, i) => i !== index));
    }
  };

  const handleBulkSave = async () => {
    const validRows = bulkRows.filter(row => row.name.trim());
    if (validRows.length === 0) return;

    for (const row of validRows) {
      await addGuest({
        name: row.name.trim(),
        phone: row.phone.trim(),
        side: bulkSide,
        relation: row.relation.trim(),
        invitationSent: false,
        attendance: 'pending',
        tableNumber: undefined,
        memo: '',
      });
    }

    setBulkRows([
      { name: '', phone: '', relation: '' },
      { name: '', phone: '', relation: '' },
      { name: '', phone: '', relation: '' },
      { name: '', phone: '', relation: '' },
      { name: '', phone: '', relation: '' },
    ]);
    setShowBulkForm(false);
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
    <div className="space-y-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">하객 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {guests.length}명 (참석: {attendingCount}명)</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              setShowBulkForm(true);
              setShowAddForm(false);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            data-testid="button-bulk-add"
            title="대량 추가"
          >
            <FaTable />
          </button>
          <button
            onClick={() => {
              setShowAddForm(true);
              setShowBulkForm(false);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-blush-400 text-white hover:bg-blush-500 transition-colors"
            data-testid="button-add-guest"
            title="하객 추가"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* 통계 - 인라인 뱃지 스타일 */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-full">
          <FaHeart className="text-blue-500 text-sm" />
          <span className="text-sm text-gray-600">신랑측</span>
          <span className="font-bold text-blue-600">{groomGuests.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-full">
          <FaHeart className="text-pink-500 text-sm" />
          <span className="text-sm text-gray-600">신부측</span>
          <span className="font-bold text-pink-600">{brideGuests.length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-full">
          <span className="text-sm text-gray-600">참석</span>
          <span className="font-bold text-green-600">{guests.filter((g) => g.attendance === 'attending').length}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-full">
          <span className="text-sm text-gray-600">미정</span>
          <span className="font-bold text-yellow-600">{guests.filter((g) => g.attendance === 'pending').length}</span>
        </div>
      </div>

      {/* 대량 추가 폼 */}
      {showBulkForm && (
        <div className="card bg-lavender-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">대량 하객 추가</h3>
            <button
              onClick={() => setShowBulkForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* 신랑/신부 선택 */}
          <div className="mb-4">
            <label className="label">구분 선택</label>
            <div className="flex gap-3">
              <button
                onClick={() => setBulkSide('groom')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  bulkSide === 'groom'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
                data-testid="button-bulk-groom"
              >
                <FaHeart className={bulkSide === 'groom' ? 'text-white' : 'text-blue-400'} />
                신랑측
              </button>
              <button
                onClick={() => setBulkSide('bride')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  bulkSide === 'bride'
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
                data-testid="button-bulk-bride"
              >
                <FaHeart className={bulkSide === 'bride' ? 'text-white' : 'text-pink-400'} />
                신부측
              </button>
            </div>
          </div>

          {/* 스프레드시트 스타일 입력 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 rounded-tl-lg">이름 *</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">연락처</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">관계</th>
                  <th className="w-10 rounded-tr-lg"></th>
                </tr>
              </thead>
              <tbody>
                {bulkRows.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blush-200 focus:border-blush-300 text-sm"
                        value={row.name}
                        onChange={(e) => updateBulkRow(index, 'name', e.target.value)}
                        placeholder="이름"
                        data-testid={`input-bulk-name-${index}`}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blush-200 focus:border-blush-300 text-sm"
                        value={row.phone}
                        onChange={(e) => updateBulkRow(index, 'phone', e.target.value)}
                        placeholder="010-0000-0000"
                        data-testid={`input-bulk-phone-${index}`}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blush-200 focus:border-blush-300 text-sm"
                        value={row.relation}
                        onChange={(e) => updateBulkRow(index, 'relation', e.target.value)}
                        placeholder="친구, 동료 등"
                        data-testid={`input-bulk-relation-${index}`}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <button
                        onClick={() => removeBulkRow(index)}
                        className="text-gray-400 hover:text-red-500 p-2"
                        disabled={bulkRows.length === 1}
                        data-testid={`button-remove-row-${index}`}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <button
              onClick={addBulkRow}
              className="flex items-center justify-center gap-2 py-2 px-4 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blush-300 hover:text-blush-500 transition-colors"
              data-testid="button-add-row"
            >
              <FaPlus className="text-sm" /> 행 추가
            </button>
            <div className="flex-1"></div>
            <button
              onClick={() => setShowBulkForm(false)}
              className="btn-secondary"
            >
              취소
            </button>
            <button
              onClick={handleBulkSave}
              className="btn-primary"
              data-testid="button-bulk-save"
            >
              {bulkRows.filter(r => r.name.trim()).length}명 일괄 저장
            </button>
          </div>
        </div>
      )}

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
                  data-testid="input-guest-name"
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
                  data-testid="input-guest-phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">구분 *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'groom' })}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.side === 'groom'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <FaHeart className={formData.side === 'groom' ? 'text-white' : 'text-blue-400'} />
                    신랑측
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'bride' })}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      formData.side === 'bride'
                        ? 'bg-pink-500 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <FaHeart className={formData.side === 'bride' ? 'text-white' : 'text-pink-400'} />
                    신부측
                  </button>
                </div>
              </div>

              <div>
                <label className="label">관계</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  placeholder="예: 친구, 직장동료, 가족"
                  data-testid="input-guest-relation"
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
                  data-testid="select-attendance"
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
                  data-testid="input-table-number"
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
                    data-testid="checkbox-invitation"
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
                data-testid="textarea-memo"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="btn-primary flex-1"
                data-testid="button-save-guest"
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

      {/* 하객 리스트 */}
      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-gray-800">
            하객 목록 <span className="text-blush-500">({filteredGuests.length}명)</span>
          </h2>
          <div className="flex gap-2">
            <select
              className="text-sm text-gray-600 bg-gray-100 border-0 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blush-200"
              value={filterSide}
              onChange={(e) => setFilterSide(e.target.value as any)}
              data-testid="filter-side"
            >
              <option value="all">전체</option>
              <option value="groom">신랑측</option>
              <option value="bride">신부측</option>
            </select>
            <select
              className="text-sm text-gray-600 bg-gray-100 border-0 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blush-200"
              value={filterAttendance}
              onChange={(e) => setFilterAttendance(e.target.value as any)}
              data-testid="filter-attendance"
            >
              <option value="all">전체</option>
              <option value="attending">참석</option>
              <option value="pending">미정</option>
              <option value="declined">불참</option>
            </select>
          </div>
        </div>
        {filteredGuests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">조건에 맞는 하객이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                data-testid={`guest-row-${guest.id}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  guest.side === 'groom' ? 'bg-blue-100' : 'bg-pink-100'
                }`}>
                  <FaHeart className={`text-lg ${
                    guest.side === 'groom' ? 'text-blue-500' : 'text-pink-500'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800 truncate">{guest.name}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
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
                    {guest.invitationSent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
                        청첩장
                      </span>
                    )}
                    {guest.tableNumber && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-700">
                        T{guest.tableNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {guest.relation && `${guest.relation}`}
                    {guest.relation && guest.phone && ' · '}
                    {guest.phone}
                    {guest.memo && ` · ${guest.memo}`}
                  </p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(guest.id)}
                    className="w-10 h-10 flex items-center justify-center text-blue-500 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
                    data-testid={`button-edit-${guest.id}`}
                  >
                    <FaEdit className="text-lg" />
                  </button>
                  <button
                    onClick={() => deleteGuest(guest.id)}
                    className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
                    data-testid={`button-delete-${guest.id}`}
                  >
                    <FaTrash className="text-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Guests;
