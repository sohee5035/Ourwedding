import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVenueStore } from '../store/venueStore';
import { FaSave, FaTimes, FaTrash } from 'react-icons/fa';

const VenueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addVenue, updateVenue, getVenueById } = useVenueStore();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 37.5665,
    lng: 126.978,
    estimate: 0,
    minGuests: 0,
    mealCost: 0,
    rentalFee: 0,
    nearestStation: '',
    memo: '',
    photos: [] as string[],
  });

  useEffect(() => {
    if (isEdit && id) {
      const venue = getVenueById(id);
      if (venue) {
        setFormData({
          name: venue.name,
          address: venue.address,
          lat: venue.lat,
          lng: venue.lng,
          estimate: venue.estimate,
          minGuests: venue.minGuests,
          mealCost: venue.mealCost,
          rentalFee: venue.rentalFee,
          nearestStation: venue.nearestStation,
          memo: venue.memo,
          photos: venue.photos,
        });
      }
    }
  }, [id, isEdit, getVenueById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim()) {
      alert('웨딩홀 이름과 주소는 필수입니다.');
      return;
    }

    if (isEdit && id) {
      updateVenue(id, formData);
    } else {
      addVenue(formData);
    }

    navigate('/venues');
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEdit ? '웨딩홀 수정' : '새 웨딩홀 추가'}
        </h1>
        <p className="text-gray-600 mt-2">웨딩홀 정보를 입력해주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* 기본 정보 */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="label">웨딩홀 이름 *</label>
              <input
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="웨딩홀 이름을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="label">주소 *</label>
              <input
                type="text"
                className="input-field"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="주소를 입력하세요"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">위도</label>
                <input
                  type="number"
                  step="0.000001"
                  className="input-field"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                  placeholder="37.5665"
                />
              </div>

              <div>
                <label className="label">경도</label>
                <input
                  type="number"
                  step="0.000001"
                  className="input-field"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                  placeholder="126.978"
                />
              </div>
            </div>

            <div>
              <label className="label">최인근 전철역</label>
              <input
                type="text"
                className="input-field"
                value={formData.nearestStation}
                onChange={(e) =>
                  setFormData({ ...formData, nearestStation: e.target.value })
                }
                placeholder="예: 강남역"
              />
            </div>
          </div>
        </div>

        {/* 비용 정보 */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">비용 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">견적 (원)</label>
              <input
                type="number"
                className="input-field"
                value={formData.estimate}
                onChange={(e) => setFormData({ ...formData, estimate: Number(e.target.value) })}
                placeholder="총 견적"
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
              />
            </div>
          </div>
        </div>

        {/* 사진 */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">사진</h2>
          <div>
            <label className="label">사진 업로드</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="input-field"
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

        {/* 메모 */}
        <div>
          <label className="label">메모</label>
          <textarea
            className="input-field"
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            placeholder="메모를 입력하세요"
            rows={4}
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 pt-4">
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <FaSave /> {isEdit ? '수정 완료' : '등록하기'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/venues')}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <FaTimes /> 취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default VenueForm;
