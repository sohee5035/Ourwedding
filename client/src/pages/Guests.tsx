import { useState, useEffect, useRef } from 'react';
import { useGuestStore } from '../store/guestStore';
import { useAuthStore } from '../store/authStore';
import { FaPlus, FaTrash, FaEdit, FaHeart, FaRegHeart, FaTable, FaTimes, FaDownload, FaUpload, FaCheck, FaUsers } from 'react-icons/fa';
import type { Guest, GroupGuest } from '../types';

interface BulkGuestRow {
  name: string;
  phone: string;
  relation: string;
}

const Guests = () => {
  const { 
    guests, addGuest, updateGuest, deleteGuest, getGuestsBySide, getAttendingCount, fetchGuests,
    groupGuests, addGroupGuest, updateGroupGuest, deleteGroupGuest, getGroupGuestsBySide, fetchGroupGuests, getTotalEstimatedCount
  } = useGuestStore();
  const { member } = useAuthStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteGroupConfirmId, setDeleteGroupConfirmId] = useState<string | null>(null);
  const [attendanceDropdownId, setAttendanceDropdownId] = useState<string | null>(null);
  const [csvUploadResult, setCsvUploadResult] = useState<{ count: number; show: boolean } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [groupFormData, setGroupFormData] = useState<Omit<GroupGuest, 'id' | 'createdAt'>>({
    name: '',
    side: 'groom',
    estimatedCount: 10,
    memo: '',
  });

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
    fetchGroupGuests();
  }, [fetchGuests, fetchGroupGuests]);

  useEffect(() => {
    if (member?.role) {
      const side = member.role === 'bride' ? 'bride' : 'groom';
      setFormData(prev => ({ ...prev, side }));
      setBulkSide(side);
      setGroupFormData(prev => ({ ...prev, side }));
    }
  }, [member?.role]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attendanceDropdownId && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-testid^="button-attendance-"]')) {
          setAttendanceDropdownId(null);
        }
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (attendanceDropdownId) setAttendanceDropdownId(null);
        if (deleteConfirmId) setDeleteConfirmId(null);
        if (showAddForm) resetForm();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [attendanceDropdownId, deleteConfirmId, showAddForm]);

  const handleQuickAttendanceChange = (guestId: string, attendance: 'pending' | 'attending' | 'declined') => {
    updateGuest(guestId, { attendance });
    setAttendanceDropdownId(null);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteGuest(id);
    setDeleteConfirmId(null);
  };

  const downloadCsvTemplate = () => {
    const headers = '이름,연락처,구분,관계,참석여부';
    const sampleRows = [
      '홍길동,010-1234-5678,신랑,대학친구,참석',
      '김영희,010-9876-5432,신부,직장동료,미정',
      '이철수,010-5555-6666,신랑,고등학교 친구,불참',
    ];
    const csvContent = [headers, ...sampleRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '하객명단_양식.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      alert('CSV 파일에 데이터가 없습니다.');
      return;
    }

    const parseSide = (value: string): 'groom' | 'bride' => {
      const v = value.trim().toLowerCase();
      if (v === '신부' || v === 'bride' || v === '신부측') return 'bride';
      return 'groom';
    };

    const parseAttendance = (value: string): 'attending' | 'pending' | 'declined' => {
      const v = value.trim().toLowerCase();
      if (v === '참석' || v === 'attending' || v === '참석예정') return 'attending';
      if (v === '불참' || v === 'declined' || v === '불참예정') return 'declined';
      return 'pending';
    };

    let addedCount = 0;
    let errorCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCsvLine(lines[i]);
        const name = values[0]?.replace(/^"|"$/g, '');
        if (!name) {
          errorCount++;
          continue;
        }

        const guestData = {
          name,
          phone: (values[1] || '').replace(/^"|"$/g, ''),
          side: parseSide((values[2] || '').replace(/^"|"$/g, '')),
          relation: (values[3] || '').replace(/^"|"$/g, ''),
          attendance: parseAttendance((values[4] || '').replace(/^"|"$/g, '')),
          invitationSent: false,
          tableNumber: undefined,
          memo: '',
        };

        await addGuest(guestData);
        addedCount++;
      } catch (e) {
        errorCount++;
      }
    }

    if (addedCount > 0) {
      setCsvUploadResult({ count: addedCount, show: true });
      setTimeout(() => setCsvUploadResult(null), 3000);
    }
    
    if (errorCount > 0 && addedCount === 0) {
      alert(`CSV 파일 형식이 올바르지 않습니다. 양식을 다운로드하여 확인해주세요.`);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const [groupFormError, setGroupFormError] = useState<string | null>(null);

  const handleAddGroupGuest = async () => {
    setGroupFormError(null);
    if (!groupFormData.name.trim()) {
      setGroupFormError('그룹명을 입력해주세요.');
      return;
    }
    if (!groupFormData.estimatedCount || groupFormData.estimatedCount < 1) {
      setGroupFormError('예상 인원수는 1명 이상이어야 합니다.');
      return;
    }
    try {
      await addGroupGuest(groupFormData);
      resetGroupForm();
    } catch (error) {
      setGroupFormError('그룹 하객 추가에 실패했습니다.');
    }
  };

  const handleEditGroupGuest = (id: string) => {
    const group = groupGuests.find((g) => g.id === id);
    if (group) {
      setGroupFormData({
        name: group.name,
        side: group.side,
        estimatedCount: group.estimatedCount,
        memo: group.memo || '',
      });
      setEditingGroupId(id);
      setShowGroupForm(true);
    }
  };

  const handleUpdateGroupGuest = async () => {
    setGroupFormError(null);
    if (!editingGroupId) return;
    if (!groupFormData.name.trim()) {
      setGroupFormError('그룹명을 입력해주세요.');
      return;
    }
    if (!groupFormData.estimatedCount || groupFormData.estimatedCount < 1) {
      setGroupFormError('예상 인원수는 1명 이상이어야 합니다.');
      return;
    }
    try {
      await updateGroupGuest(editingGroupId, groupFormData);
      resetGroupForm();
    } catch (error) {
      setGroupFormError('그룹 하객 수정에 실패했습니다.');
    }
  };

  const resetGroupForm = () => {
    setGroupFormData({
      name: '',
      side: defaultSide,
      estimatedCount: 10,
      memo: '',
    });
    setEditingGroupId(null);
    setShowGroupForm(false);
    setGroupFormError(null);
  };

  const handleDeleteGroupConfirm = async (id: string) => {
    await deleteGroupGuest(id);
    setDeleteGroupConfirmId(null);
  };

  const groomGuests = getGuestsBySide('groom');
  const brideGuests = getGuestsBySide('bride');
  const groomGroupGuests = getGroupGuestsBySide('groom');
  const brideGroupGuests = getGroupGuestsBySide('bride');
  const groomGroupTotal = groomGroupGuests.reduce((sum, g) => sum + g.estimatedCount, 0);
  const brideGroupTotal = brideGroupGuests.reduce((sum, g) => sum + g.estimatedCount, 0);
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
          <p className="text-sm text-gray-500 mt-1">
            총 {getTotalEstimatedCount()}명
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={downloadCsvTemplate}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            data-testid="button-download-template"
            title="CSV 양식 다운로드"
          >
            <FaDownload />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            data-testid="button-upload-csv"
            title="CSV 업로드"
          >
            <FaUpload />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
            data-testid="input-csv-file"
          />
          <button
            onClick={() => {
              setShowBulkForm(true);
              setShowAddForm(false);
              setShowGroupForm(false);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            data-testid="button-bulk-add"
            title="대량 추가"
          >
            <FaTable />
          </button>
          <button
            onClick={() => {
              setShowGroupForm(true);
              setShowAddForm(false);
              setShowBulkForm(false);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-purple-200 text-purple-500 hover:bg-purple-50 transition-colors"
            data-testid="button-add-group"
            title="그룹 하객 추가"
          >
            <FaUsers />
          </button>
          <button
            onClick={() => {
              setShowAddForm(true);
              setShowBulkForm(false);
              setShowGroupForm(false);
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
          <span className="font-bold text-blue-600">{groomGuests.length + groomGroupTotal}</span>
          {groomGroupTotal > 0 && <span className="text-xs text-blue-400">({groomGuests.length}+{groomGroupTotal})</span>}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-full">
          <FaHeart className="text-pink-500 text-sm" />
          <span className="text-sm text-gray-600">신부측</span>
          <span className="font-bold text-pink-600">{brideGuests.length + brideGroupTotal}</span>
          {brideGroupTotal > 0 && <span className="text-xs text-pink-400">({brideGuests.length}+{brideGroupTotal})</span>}
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

      {/* CSV 업로드 결과 알림 */}
      {csvUploadResult?.show && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700">
          <FaCheck className="text-green-500" />
          <span className="font-medium">{csvUploadResult.count}명의 하객이 추가되었습니다!</span>
        </div>
      )}

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

      {/* 그룹 하객 추가/수정 폼 */}
      {showGroupForm && (
        <div className="card bg-purple-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingGroupId ? '그룹 하객 수정' : '그룹 하객 추가'}
            </h3>
            <button
              onClick={resetGroupForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            부모님 지인, 친척 등 이름 없이 인원수만 관리하는 그룹을 추가하세요.
          </p>

          {groupFormError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {groupFormError}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">그룹명 *</label>
                <input
                  type="text"
                  className="input-field"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  placeholder="예: 아버지 지인, 어머니 친척"
                  data-testid="input-group-name"
                />
              </div>
              <div>
                <label className="label">예상 인원수 *</label>
                <input
                  type="number"
                  className="input-field"
                  value={groupFormData.estimatedCount}
                  onChange={(e) => setGroupFormData({ ...groupFormData, estimatedCount: Math.max(1, Number(e.target.value)) })}
                  min={1}
                  data-testid="input-group-count"
                />
              </div>
            </div>

            <div>
              <label className="label">구분 *</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setGroupFormData({ ...groupFormData, side: 'groom' })}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    groupFormData.side === 'groom'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                  data-testid="button-group-groom"
                >
                  <FaHeart className={groupFormData.side === 'groom' ? 'text-white' : 'text-blue-400'} />
                  신랑측
                </button>
                <button
                  onClick={() => setGroupFormData({ ...groupFormData, side: 'bride' })}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    groupFormData.side === 'bride'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                  data-testid="button-group-bride"
                >
                  <FaHeart className={groupFormData.side === 'bride' ? 'text-white' : 'text-pink-400'} />
                  신부측
                </button>
              </div>
            </div>

            <div>
              <label className="label">메모</label>
              <textarea
                className="input-field"
                value={groupFormData.memo}
                onChange={(e) => setGroupFormData({ ...groupFormData, memo: e.target.value })}
                placeholder="메모 (선택사항)"
                rows={2}
                data-testid="textarea-group-memo"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={resetGroupForm} className="btn-secondary flex-1">
                취소
              </button>
              <button
                onClick={editingGroupId ? handleUpdateGroupGuest : handleAddGroupGuest}
                className="btn-primary flex-1"
                data-testid="button-save-group"
              >
                {editingGroupId ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 그룹 하객 목록 */}
      {groupGuests.length > 0 && (
        <div className="card !p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100 bg-purple-50">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FaUsers className="text-purple-500" />
              그룹 하객 <span className="text-purple-500">({groupGuests.length}그룹, {groupGuests.reduce((sum, g) => sum + g.estimatedCount, 0)}명)</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {groupGuests.map((group) => (
              <div 
                key={group.id} 
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                data-testid={`group-row-${group.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    group.side === 'groom' ? 'bg-blue-400' : 'bg-pink-400'
                  }`}>
                    {group.estimatedCount}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{group.name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        group.side === 'groom' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-pink-50 text-pink-600'
                      }`}>
                        <FaHeart className="text-[10px]" />
                        {group.side === 'groom' ? '신랑' : '신부'}
                      </span>
                    </div>
                    {group.memo && (
                      <p className="text-xs text-gray-500 mt-0.5">{group.memo}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditGroupGuest(group.id)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                    data-testid={`button-edit-group-${group.id}`}
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => setDeleteGroupConfirmId(group.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    data-testid={`button-delete-group-${group.id}`}
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 그룹 하객 삭제 확인 모달 */}
      {deleteGroupConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteGroupConfirmId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-red-500 text-lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">그룹 하객 삭제</h3>
            <p className="text-gray-600 mb-6">
              '{groupGuests.find(g => g.id === deleteGroupConfirmId)?.name}' 그룹을 삭제하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteGroupConfirmId(null)}
                className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteGroupConfirm(deleteGroupConfirmId)}
                className="flex-1 py-2.5 px-4 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                data-testid="button-confirm-delete-group"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 추가/수정 모달 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? '하객 정보 수정' : '새 하객 추가'}
              </h3>
              <button
                onClick={resetForm}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 space-y-4">
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

              <div className="flex gap-2 pt-2">
                <button onClick={resetForm} className="btn-secondary flex-1">
                  취소
                </button>
                <button
                  onClick={editingId ? handleUpdate : handleAdd}
                  className="btn-primary flex-1"
                  data-testid="button-save-guest"
                >
                  {editingId ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-red-500 text-lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">하객 삭제</h3>
            <p className="text-gray-600 mb-6">
              '{guests.find(g => g.id === deleteConfirmId)?.name}' 님을 삭제하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 px-4 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                className="flex-1 py-2.5 px-4 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                data-testid="button-confirm-delete"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하객 리스트 */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="py-3 px-4 font-medium">이름</th>
                  <th className="py-3 px-4 font-medium hidden md:table-cell">연락처</th>
                  <th className="py-3 px-4 font-medium">구분</th>
                  <th className="py-3 px-4 font-medium hidden md:table-cell">관계</th>
                  <th className="py-3 px-4 font-medium">참석</th>
                  <th className="py-3 px-4 font-medium w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGuests.map((guest) => (
                  <tr 
                    key={guest.id} 
                    className="hover:bg-gray-50 transition-colors"
                    data-testid={`guest-row-${guest.id}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800">{guest.name}</span>
                        {guest.invitationSent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-600">청첩장</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 md:hidden">
                        {guest.phone || '-'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                      {guest.phone || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        guest.side === 'groom' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-pink-50 text-pink-600'
                      }`}>
                        <FaHeart className="text-[10px]" />
                        {guest.side === 'groom' ? '신랑' : '신부'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                      {guest.relation || '-'}
                    </td>
                    <td className="py-3 px-4 relative">
                      <button
                        onClick={() => setAttendanceDropdownId(attendanceDropdownId === guest.id ? null : guest.id)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:ring-2 hover:ring-offset-1 transition-all ${
                          guest.attendance === 'attending'
                            ? 'bg-green-100 text-green-700 hover:ring-green-300'
                            : guest.attendance === 'declined'
                            ? 'bg-red-100 text-red-700 hover:ring-red-300'
                            : 'bg-yellow-100 text-yellow-700 hover:ring-yellow-300'
                        }`}
                        data-testid={`button-attendance-${guest.id}`}
                      >
                        {guest.attendance === 'attending' ? '참석' : guest.attendance === 'declined' ? '불참' : '미정'}
                      </button>
                      {attendanceDropdownId === guest.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-[80px]"
                        >
                          <button
                            onClick={() => handleQuickAttendanceChange(guest.id, 'attending')}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${guest.attendance === 'attending' ? 'text-green-600 font-medium' : 'text-gray-700'}`}
                          >
                            참석
                          </button>
                          <button
                            onClick={() => handleQuickAttendanceChange(guest.id, 'pending')}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${guest.attendance === 'pending' ? 'text-yellow-600 font-medium' : 'text-gray-700'}`}
                          >
                            미정
                          </button>
                          <button
                            onClick={() => handleQuickAttendanceChange(guest.id, 'declined')}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${guest.attendance === 'declined' ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                          >
                            불참
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(guest.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          data-testid={`button-edit-${guest.id}`}
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(guest.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          data-testid={`button-delete-${guest.id}`}
                        >
                          <FaTrash className="text-sm" />
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
