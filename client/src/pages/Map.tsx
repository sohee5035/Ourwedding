import { useEffect, useRef, useState } from 'react';
import { useVenueStore } from '../store/venueStore';
import { FaMapMarkerAlt } from 'react-icons/fa';

declare global {
  interface Window {
    kakao: any;
  }
}

const Map = () => {
  const { venues } = useVenueStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  useEffect(() => {
    // Kakao Map 스크립트 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&autoload=false`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 중심
            level: 8,
          };

          const newMap = new window.kakao.maps.Map(mapRef.current, options);
          setMap(newMap);

          // 웨딩홀 마커 추가
          venues.forEach((venue) => {
            const markerPosition = new window.kakao.maps.LatLng(venue.lat, venue.lng);

            const marker = new window.kakao.maps.Marker({
              position: markerPosition,
              map: newMap,
            });

            // 마커 클릭 이벤트
            window.kakao.maps.event.addListener(marker, 'click', () => {
              setSelectedVenue(venue.id);
              newMap.setCenter(markerPosition);
            });

            // 인포윈도우
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:10px;min-width:150px;">
                <h3 style="font-weight:bold;margin:0 0 5px 0;">${venue.name}</h3>
                <p style="margin:0;font-size:12px;">${venue.estimate.toLocaleString()}원</p>
              </div>`,
            });

            window.kakao.maps.event.addListener(marker, 'mouseover', () => {
              infowindow.open(newMap, marker);
            });

            window.kakao.maps.event.addListener(marker, 'mouseout', () => {
              infowindow.close();
            });
          });

          // 첫 번째 웨딩홀 중심으로 이동
          if (venues.length > 0) {
            const firstVenue = venues[0];
            newMap.setCenter(new window.kakao.maps.LatLng(firstVenue.lat, firstVenue.lng));
          }
        }
      });
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [venues]);

  const moveToVenue = (lat: number, lng: number, venueId: string) => {
    if (map) {
      const position = new window.kakao.maps.LatLng(lat, lng);
      map.setCenter(position);
      map.setLevel(3);
      setSelectedVenue(venueId);
    }
  };

  const selectedVenueData = venues.find((v) => v.id === selectedVenue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">웨딩홀 지도</h1>
        <p className="text-gray-600 mt-2">지도에서 등록된 웨딩홀을 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 지도 */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <div ref={mapRef} className="w-full h-[600px]" />
            {venues.length === 0 && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">등록된 웨딩홀이 없습니다</p>
                  <a href="/venues/add" className="btn-primary mt-4 inline-block">
                    웨딩홀 추가하기
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 웨딩홀 목록 */}
        <div className="lg:col-span-1">
          <div className="card max-h-[600px] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              웨딩홀 목록 ({venues.length})
            </h2>

            {venues.length === 0 ? (
              <p className="text-gray-500 text-center py-8">등록된 웨딩홀이 없습니다</p>
            ) : (
              <div className="space-y-3">
                {venues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => moveToVenue(venue.lat, venue.lng, venue.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedVenue === venue.id
                        ? 'border-blush-400 bg-blush-50'
                        : 'border-gray-200 hover:border-blush-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt
                        className={`mt-1 ${
                          selectedVenue === venue.id ? 'text-blush-500' : 'text-gray-400'
                        }`}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{venue.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{venue.address}</p>
                        <div className="text-sm space-y-1">
                          <p className="text-blush-600 font-semibold">
                            {venue.estimate.toLocaleString()}원
                          </p>
                          <p className="text-gray-600 text-xs">
                            {venue.nearestStation && `🚇 ${venue.nearestStation}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 선택된 웨딩홀 상세 정보 */}
      {selectedVenueData && (
        <div className="card bg-blush-50">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {selectedVenueData.name}
          </h2>

          {selectedVenueData.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {selectedVenueData.photos.slice(0, 4).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${selectedVenueData.name} ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">견적</p>
              <p className="font-semibold text-blush-600">
                {selectedVenueData.estimate.toLocaleString()}원
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">최소인원</p>
              <p className="font-semibold">{selectedVenueData.minGuests}명</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">식대</p>
              <p className="font-semibold">{selectedVenueData.mealCost.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">대관료</p>
              <p className="font-semibold">{selectedVenueData.rentalFee.toLocaleString()}원</p>
            </div>
          </div>

          {selectedVenueData.memo && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">메모</p>
              <p className="text-gray-800">{selectedVenueData.memo}</p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <a
              href={`/venues/edit/${selectedVenueData.id}`}
              className="btn-primary text-center"
            >
              수정하기
            </a>
            <a href="/venues" className="btn-secondary text-center">
              전체 목록 보기
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
