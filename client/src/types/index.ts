// 사진 정보 (Cloudinary)
export interface VenuePhoto {
  url: string;
  publicId: string;
}

// 웨딩홀 기본 정보
export interface WeddingVenue {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  nearestStation: string; // 최인근 전철역
  photos: VenuePhoto[]; // Cloudinary 이미지 정보
  createdAt: string;
  updatedAt: string;
}

// 웨딩홀 견적 (날짜/시간별)
export interface VenueQuote {
  id: string;
  venueId: string;
  date?: string; // 예식 날짜 (YYYY-MM-DD)
  time?: string; // 예식 시간 (HH:mm)
  estimate: number; // 견적
  minGuests: number; // 최소보증인원
  mealCost: number; // 식대 (1인당)
  rentalFee: number; // 대관료
  memo: string;
  photos: string[]; // Base64 또는 URL
  createdAt: string;
  updatedAt: string;
}

// 웨딩홀 + 견적 통합 (UI용)
export interface VenueWithQuotes extends WeddingVenue {
  quotes: VenueQuote[];
}

// 준비 체크리스트 아이템
export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string; // D-365, D-180 등 (텍스트 표시용)
  date?: string; // YYYY-MM-DD (달력 표시용)
  category?: string; // 웨딩홀, 드레스, 스튜디오 등
  createdAt: string;
}

// 예산 항목
export interface BudgetItem {
  id: string;
  category: string; // 웨딩홀, 스튜디오, 드레스, 메이크업 등
  budgetAmount: number; // 예산
  actualAmount: number; // 실제 지출
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

// 하객 정보
export interface Guest {
  id: string;
  name: string;
  phone: string;
  side: 'groom' | 'bride'; // 신랑측 / 신부측
  relation?: string; // 친구, 직장동료, 가족 등
  invitationSent: boolean; // 청첩장 발송 여부
  attendance: 'pending' | 'attending' | 'declined'; // 참석 여부
  tableNumber?: number; // 좌석 배치
  memo?: string;
  createdAt: string;
}

// 그룹 하객 (부모님 지인, 친척 등 이름 없이 인원수만 관리)
export interface GroupGuest {
  id: string;
  name: string; // 그룹명 (예: 아버지 지인, 어머니 친척 등)
  side: 'groom' | 'bride'; // 신랑측 / 신부측
  estimatedCount: number; // 예상 인원수
  memo?: string;
  createdAt: string;
}

// 결혼식 정보
export interface WeddingInfo {
  weddingDate?: string;
  groomName?: string;
  brideName?: string;
  totalBudget?: number;
}
