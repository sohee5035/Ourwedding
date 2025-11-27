import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVenueStore } from '../store/venueStore';
import { FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const VenueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addVenue, updateVenue, getVenueById, fetchVenues } = useVenueStore();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 37.5665,
    lng: 126.978,
    nearestStation: '',
  });

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  useEffect(() => {
    if (isEdit && id) {
      const venue = getVenueById(id);
      if (venue) {
        setFormData({
          name: venue.name,
          address: venue.address,
          lat: venue.lat,
          lng: venue.lng,
          nearestStation: venue.nearestStation || '',
        });
      }
    }
  }, [id, isEdit, getVenueById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim()) {
      alert('웨딩홀 이름과 주소는 필수입니다.');
      return;
    }

    try {
      if (isEdit && id) {
        await updateVenue(id, formData);
        navigate('/venues');
      } else {
        const newVenue = await addVenue(formData);
        navigate(`/venues/${newVenue.id}/quotes/add`);
      }
    } catch (error) {
      console.error('Failed to save venue:', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEdit ? '웨딩홀 정보 수정' : '새 웨딩홀 추가'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEdit ? '웨딩홀 기본 정보를 수정해주세요' : '웨딩홀 기본 정보를 입력해주세요. 견적은 다음 단계에서 추가합니다.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
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
              data-testid="input-venue-name"
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
              data-testid="input-venue-address"
            />
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
              placeholder="예: 강남역 5번 출구"
              data-testid="input-venue-station"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">위도 (lat)</label>
              <input
                type="number"
                step="0.0001"
                className="input-field"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                data-testid="input-venue-lat"
              />
            </div>
            <div>
              <label className="label">경도 (lng)</label>
              <input
                type="number"
                step="0.0001"
                className="input-field"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                data-testid="input-venue-lng"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            지도에서 위치를 표시하기 위해 위도/경도를 입력해주세요. 네이버 지도에서 해당 주소를 검색하면 URL에서 확인할 수 있습니다.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            data-testid="button-save-venue"
          >
            {isEdit ? (
              <>
                <FaSave /> 수정 완료
              </>
            ) : (
              <>
                <FaPlus /> 다음: 견적 추가
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/venues')}
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

export default VenueForm;
