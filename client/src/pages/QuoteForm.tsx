import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useVenueStore } from '../store/venueStore';
import { FaSave, FaTimes, FaTrash, FaPlus } from 'react-icons/fa';

const QuoteForm = () => {
  const [, addParams] = useRoute('/venues/:venueId/quotes/add');
  const [, editParams] = useRoute('/venues/quotes/edit/:quoteId');
  const [, setLocation] = useLocation();
  const venueId = addParams?.venueId;
  const quoteId = editParams?.quoteId;
  const { 
    addVenueQuote, 
    updateVenueQuote, 
    getVenueById, 
    venueQuotes,
    fetchVenues,
    fetchVenueQuotes 
  } = useVenueStore();
  const isEdit = !!quoteId;

  const [formData, setFormData] = useState({
    venueId: venueId || '',
    date: '',
    time: '',
    estimate: 0,
    minGuests: 0,
    mealCost: 0,
    rentalFee: 0,
    memo: '',
    photos: [] as string[],
  });

  const venue = venueId ? getVenueById(venueId) : null;
  const existingQuote = quoteId ? venueQuotes.find(q => q.id === quoteId) : null;

  useEffect(() => {
    fetchVenues();
    fetchVenueQuotes();
  }, [fetchVenues, fetchVenueQuotes]);

  useEffect(() => {
    if (isEdit && existingQuote) {
      setFormData({
        venueId: existingQuote.venueId,
        date: existingQuote.date || '',
        time: existingQuote.time || '',
        estimate: existingQuote.estimate || 0,
        minGuests: existingQuote.minGuests || 0,
        mealCost: existingQuote.mealCost || 0,
        rentalFee: existingQuote.rentalFee || 0,
        memo: existingQuote.memo || '',
        photos: existingQuote.photos || [],
      });
    }
  }, [isEdit, existingQuote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit && quoteId) {
        await updateVenueQuote(quoteId, formData);
      } else {
        await addVenueQuote(formData);
      }
      await Promise.all([fetchVenues(), fetchVenueQuotes()]);
      setLocation('/venues');
    } catch (error) {
      console.error('Failed to save quote:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, base64],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const editVenue = isEdit && existingQuote ? getVenueById(existingQuote.venueId) : venue;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEdit ? '견적 수정' : '새 견적 추가'}
        </h1>
        {editVenue && (
          <p className="text-blush-600 mt-2 font-medium">{editVenue.name}</p>
        )}
        <p className="text-gray-600 mt-1">
          {isEdit ? '견적 정보를 수정해주세요' : '날짜와 시간별 견적 정보를 입력해주세요'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">예식 일정</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">예식 날짜</label>
              <input
                type="date"
                className="input-field"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                data-testid="input-quote-date"
              />
            </div>
            <div>
              <label className="label">예식 시간</label>
              <input
                type="time"
                className="input-field"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                data-testid="input-quote-time"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            같은 웨딩홀이라도 날짜와 시간에 따라 견적이 다를 수 있으니, 각각 등록해서 비교해보세요.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">비용 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">총 견적 (원)</label>
              <input
                type="number"
                className="input-field"
                value={formData.estimate}
                onChange={(e) => setFormData({ ...formData, estimate: Number(e.target.value) })}
                placeholder="총 견적"
                data-testid="input-quote-estimate"
              />
            </div>

            <div>
              <label className="label">대관료 (원)</label>
              <input
                type="number"
                className="input-field"
                value={formData.rentalFee}
                onChange={(e) =>
                  setFormData({ ...formData, rentalFee: Number(e.target.value) })
                }
                placeholder="대관료"
                data-testid="input-quote-rental"
              />
            </div>

            <div>
              <label className="label">식대 (1인당, 원)</label>
              <input
                type="number"
                className="input-field"
                value={formData.mealCost}
                onChange={(e) => setFormData({ ...formData, mealCost: Number(e.target.value) })}
                placeholder="1인당 식대"
                data-testid="input-quote-meal"
              />
            </div>

            <div>
              <label className="label">최소보증인원 (명)</label>
              <input
                type="number"
                className="input-field"
                value={formData.minGuests}
                onChange={(e) =>
                  setFormData({ ...formData, minGuests: Number(e.target.value) })
                }
                placeholder="최소보증인원"
                data-testid="input-quote-guests"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">사진</h2>
          <div>
            <label className="label">견적서/홀 사진 업로드</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="input-field"
              data-testid="input-quote-photos"
            />
            <p className="text-xs text-gray-500 mt-1">여러 장 선택 가능합니다</p>
          </div>

          {formData.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`사진 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">메모</label>
          <textarea
            className="input-field"
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            placeholder="추가 메모를 입력하세요 (할인 정보, 포함 항목 등)"
            rows={4}
            data-testid="input-quote-memo"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            data-testid="button-save-quote"
          >
            {isEdit ? (
              <>
                <FaSave /> 수정 완료
              </>
            ) : (
              <>
                <FaPlus /> 견적 등록
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setLocation('/venues')}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
            data-testid="button-cancel"
          >
            <FaTimes /> 취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;
