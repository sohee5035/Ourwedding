import { useState, useEffect } from 'react';
import { useVenueStore } from '../store/venueStore';
import { Link } from 'react-router-dom';
import { FaPlus, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';

const Venues = () => {
  const { venues, deleteVenue, fetchVenues } = useVenueStore();
  const [sortBy, setSortBy] = useState<'name' | 'estimate' | 'recent'>('recent');

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const sortedVenues = [...venues].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'estimate':
        return a.estimate - b.estimate;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`"${name}" 웨딩홀을 삭제하시겠습니까?`)) {
      deleteVenue(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">웨딩홀 리스트</h1>
          <p className="text-gray-600 mt-2">총 {venues.length}개 웨딩홀</p>
        </div>
        <Link to="/venues/add" className="btn-primary flex items-center gap-2">
          <FaPlus /> 웨딩홀 추가
        </Link>
      </div>

      {/* 정렬 */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">정렬:</label>
          <select
            className="input-field max-w-xs"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="recent">최근 등록순</option>
            <option value="name">이름순</option>
            <option value="estimate">견적순</option>
          </select>
        </div>
      </div>

      {/* 웨딩홀 목록 */}
      {venues.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">아직 등록된 웨딩홀이 없습니다</p>
          <Link to="/venues/add" className="btn-primary inline-flex items-center gap-2">
            <FaPlus /> 첫 웨딩홀 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedVenues.map((venue) => (
            <div key={venue.id} className="card hover:shadow-lg transition-shadow">
              {/* 사진 */}
              {venue.photos.length > 0 ? (
                <img
                  src={venue.photos[0]}
                  alt={venue.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blush-100 to-lavender-100 rounded-lg mb-4 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-6xl text-blush-300" />
                </div>
              )}

              {/* 정보 */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{venue.name}</h3>
              <p className="text-sm text-gray-600 mb-3 flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" />
                <span>{venue.address}</span>
              </p>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">견적:</span>
                  <span className="font-semibold text-blush-600">
                    {venue.estimate.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">최소인원:</span>
                  <span className="font-semibold">{venue.minGuests}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">식대:</span>
                  <span className="font-semibold">{venue.mealCost.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">대관료:</span>
                  <span className="font-semibold">{venue.rentalFee.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">최인근역:</span>
                  <span className="font-semibold">{venue.nearestStation}</span>
                </div>
              </div>

              {venue.memo && (
                <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                  {venue.memo}
                </p>
              )}

              {/* 버튼 */}
              <div className="flex gap-2">
                <Link
                  to={`/venues/edit/${venue.id}`}
                  className="btn-secondary flex-1 text-center flex items-center justify-center gap-2"
                >
                  <FaEdit /> 수정
                </Link>
                <button
                  onClick={() => handleDelete(venue.id, venue.name)}
                  className="btn-secondary flex items-center justify-center gap-2 text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                >
                  <FaTrash /> 삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Venues;
