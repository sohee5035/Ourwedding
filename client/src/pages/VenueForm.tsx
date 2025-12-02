import { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useVenueStore } from '../store/venueStore';
import { FaSave, FaTimes, FaPlus, FaCamera, FaTrash, FaSpinner, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import type { VenuePhoto } from '../types';

declare global {
  interface Window {
    kakao: any;
  }
}

interface SearchResult {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string; // lng
  y: string; // lat
  place_url: string;
}

const VenueForm = () => {
  const [, params] = useRoute('/venues/edit/:id');
  const [, setLocation] = useLocation();
  const id = params?.id;
  const { addVenue, updateVenue, getVenueById, fetchVenues } = useVenueStore();
  const isEdit = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_PHOTOS = 10;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    nearestStation: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
    photos: [] as VenuePhoto[],
  });
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // 장소 검색 관련 state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
          nearestStation: venue.nearestStation || '',
          lat: venue.lat,
          lng: venue.lng,
          photos: venue.photos || [],
        });
      }
    }
  }, [id, isEdit, getVenueById]);

  // 장소 검색 함수
  const handlePlaceSearch = () => {
    if (!searchKeyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      alert('카카오맵이 로드되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }

    setIsSearching(true);
    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(searchKeyword, (data: any, status: any) => {
      setIsSearching(false);
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
        setShowSearchResults(true);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 없습니다.');
        setSearchResults([]);
      } else {
        alert('검색 중 오류가 발생했습니다.');
        setSearchResults([]);
      }
    });
  };

  // 장소 선택 함수
  const handleSelectPlace = (place: SearchResult) => {
    setFormData({
      ...formData,
      name: place.place_name,
      address: place.road_address_name || place.address_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
    });
    setShowSearchResults(false);
    setSearchKeyword('');
  };

  // 주소로 좌표 찾기 (Geocoding)
  const geocodeAddress = (address: string) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        }));
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_PHOTOS - formData.photos.length;
    if (remainingSlots <= 0) {
      alert(`사진은 최대 ${MAX_PHOTOS}장까지만 추가할 수 있습니다.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      alert(`사진은 최대 ${MAX_PHOTOS}장까지만 추가할 수 있습니다. ${remainingSlots}장만 업로드됩니다.`);
    }

    setUploading(true);
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return { url: data.url, publicId: data.publicId } as VenuePhoto;
      });

      const photos = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...photos]
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number, publicId: string) => {
    setDeleting(publicId);
    try {
      const response = await fetch(`/api/upload/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        alert('사진 삭제에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter((_, i) => i !== index)
      }));
    } catch (error) {
      console.error('Delete error:', error);
      alert('사진 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.address.trim()) {
      alert('웨딩홀 이름과 주소는 필수입니다.');
      return;
    }

    try {
      if (isEdit && id) {
        await updateVenue(id, formData);
        await fetchVenues();
        setLocation('/venues');
      } else {
        const newVenue = await addVenue(formData);
        await fetchVenues();
        setLocation(`/venues/${newVenue.id}/quotes/add`);
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
          {/* 장소 검색 */}
          <div className="bg-gradient-to-r from-blush-50 to-lavender-50 p-4 rounded-lg border border-blush-200">
            <label className="label text-blush-700 mb-2">
              <FaSearch className="inline mr-2" />
              웨딩홀 검색으로 빠르게 추가하기
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handlePlaceSearch())}
                placeholder="웨딩홀 이름을 검색하세요 (예: 그랜드컨벤션센터)"
              />
              <button
                type="button"
                onClick={handlePlaceSearch}
                disabled={isSearching}
                className="btn-primary px-4 whitespace-nowrap"
              >
                {isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              </button>
            </div>

            {/* 검색 결과 */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-3 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
                {searchResults.map((place, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="w-full text-left p-3 hover:bg-blush-50 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-blush-500 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{place.place_name}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {place.road_address_name || place.address_name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-600 mt-2">
              💡 검색으로 선택하면 이름, 주소, 위치가 자동으로 입력됩니다
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 mb-4">또는 직접 입력하기</p>
          </div>

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
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  geocodeAddress(e.target.value);
                }
              }}
              placeholder="주소를 입력하세요"
              required
              data-testid="input-venue-address"
            />
            <p className="text-xs text-gray-500 mt-1">
              주소 입력 후 다른 곳을 클릭하면 자동으로 지도 위치가 설정됩니다
            </p>
            {formData.lat && formData.lng && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaMapMarkerAlt />
                위치 확인됨 ({formData.lat.toFixed(6)}, {formData.lng.toFixed(6)})
              </p>
            )}
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

          <div>
            <label className="label">
              웨딩홀 사진 
              <span className="text-gray-400 font-normal ml-2">
                ({formData.photos.length}/{MAX_PHOTOS})
              </span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              data-testid="input-venue-photos"
            />
            <div className="grid grid-cols-3 gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={photo.url} 
                    alt={`웨딩홀 사진 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, photo.publicId)}
                    disabled={deleting === photo.publicId}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    data-testid={`remove-photo-${index}`}
                  >
                    {deleting === photo.publicId ? (
                      <FaSpinner className="text-xs animate-spin" />
                    ) : (
                      <FaTrash className="text-xs" />
                    )}
                  </button>
                </div>
              ))}
              {formData.photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blush-400 hover:text-blush-500 transition-colors disabled:opacity-50"
                  data-testid="button-add-photo"
                >
                  {uploading ? (
                    <FaSpinner className="text-xl animate-spin" />
                  ) : (
                    <>
                      <FaCamera className="text-xl" />
                      <span className="text-xs">사진 추가</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              웨딩홀 외관, 홀 내부, 로비 등의 사진을 추가하세요
            </p>
          </div>
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

export default VenueForm;
