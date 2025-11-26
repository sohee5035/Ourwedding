import { useState } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const Budget = () => {
  const { items, addItem, updateItem, deleteItem, getTotalBudget, getTotalActual } =
    useBudgetStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    budgetAmount: 0,
    actualAmount: 0,
    memo: '',
  });

  const totalBudget = getTotalBudget();
  const totalActual = getTotalActual();
  const remaining = totalBudget - totalActual;

  const handleAdd = () => {
    if (!formData.category.trim()) return;

    addItem({
      category: formData.category,
      budgetAmount: formData.budgetAmount,
      actualAmount: formData.actualAmount,
      memo: formData.memo,
    });

    setFormData({ category: '', budgetAmount: 0, actualAmount: 0, memo: '' });
    setShowAddForm(false);
  };

  const handleEdit = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setFormData({
        category: item.category,
        budgetAmount: item.budgetAmount,
        actualAmount: item.actualAmount,
        memo: item.memo || '',
      });
      setEditingId(id);
      setShowAddForm(true);
    }
  };

  const handleUpdate = () => {
    if (!editingId || !formData.category.trim()) return;

    updateItem(editingId, {
      category: formData.category,
      budgetAmount: formData.budgetAmount,
      actualAmount: formData.actualAmount,
      memo: formData.memo,
    });

    setFormData({ category: '', budgetAmount: 0, actualAmount: 0, memo: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setFormData({ category: '', budgetAmount: 0, actualAmount: 0, memo: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">예산 관리</h1>
          <p className="text-gray-600 mt-2">총 {items.length}개 항목</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus /> 항목 추가
        </button>
      </div>

      {/* 예산 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50">
          <h3 className="text-sm text-gray-600 mb-2">총 예산</h3>
          <p className="text-2xl font-bold text-blue-600">
            {totalBudget.toLocaleString()}원
          </p>
        </div>

        <div className="card bg-red-50">
          <h3 className="text-sm text-gray-600 mb-2">실제 지출</h3>
          <p className="text-2xl font-bold text-red-600">
            {totalActual.toLocaleString()}원
          </p>
        </div>

        <div className="card bg-green-50">
          <h3 className="text-sm text-gray-600 mb-2">잔액</h3>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {remaining.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 추가/수정 폼 */}
      {showAddForm && (
        <div className="card bg-blush-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingId ? '예산 항목 수정' : '새 예산 항목 추가'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">카테고리 *</label>
              <input
                type="text"
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="예: 웨딩홀, 스튜디오, 드레스, 메이크업"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">예산 금액 (원) *</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.budgetAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, budgetAmount: Number(e.target.value) })
                  }
                  placeholder="예산 금액"
                />
              </div>

              <div>
                <label className="label">실제 지출 (원)</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.actualAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, actualAmount: Number(e.target.value) })
                  }
                  placeholder="실제 지출 금액"
                />
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
              <button onClick={handleCancel} className="btn-secondary flex-1">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 예산 항목 리스트 */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">예산 항목</h2>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">아직 등록된 항목이 없습니다</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">카테고리</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">예산</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">실제 지출</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">차액</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">진행률</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const difference = item.budgetAmount - item.actualAmount;
                  const percentage =
                    item.budgetAmount > 0
                      ? Math.round((item.actualAmount / item.budgetAmount) * 100)
                      : 0;

                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-800">{item.category}</p>
                          {item.memo && (
                            <p className="text-sm text-gray-500 mt-1">{item.memo}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600 font-medium">
                        {item.budgetAmount.toLocaleString()}원
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-medium">
                        {item.actualAmount.toLocaleString()}원
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          difference >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {difference.toLocaleString()}원
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className={`h-2 rounded-full ${
                                percentage > 100
                                  ? 'bg-red-500'
                                  : percentage > 80
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 min-w-[45px]">
                            {percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="text-blue-500 hover:text-blue-600 p-2"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-red-500 hover:text-red-600 p-2"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
