import { FaWallet, FaTools } from 'react-icons/fa';

const Budget = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blush-100 to-blush-200 flex items-center justify-center">
          <FaWallet className="text-4xl text-blush-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center border-2 border-white">
          <FaTools className="text-lg text-gold-500" />
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-serif font-bold text-gray-800">예산 관리</h1>
        <p className="text-xl text-blush-400 font-medium">준비중입니다</p>
        <p className="text-gray-500 max-w-md">
          더 나은 예산 관리 기능을 준비하고 있어요.<br />
          조금만 기다려 주세요!
        </p>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-br from-blush-50 to-ivory-100 rounded-2xl border border-blush-100 max-w-sm">
        <h3 className="font-medium text-gray-700 mb-3">예정된 기능</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blush-300"></span>
            카테고리별 예산 설정
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blush-300"></span>
            실제 지출 내역 관리
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blush-300"></span>
            예산 vs 실제 비교 차트
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blush-300"></span>
            업체별 결제 일정 관리
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Budget;
