import React from 'react'

const PromotionPanel: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-800 p-6 lg:p-8">
      <div className="mb-6 flex items-center lg:mb-8">
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-pink-500">
          <span className="text-lg font-bold text-white">C</span>
        </div>
        <span className="text-xl font-bold text-white lg:text-2xl">CareCode</span>
      </div>

      {/* 헤드라인 */}
      <h1 className="mb-6 text-center text-lg text-white lg:mb-8 lg:text-xl">
        우리 아이 케어를 위한 엄마들의 선택
      </h1>

      {/* QR 코드 */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-lg bg-white lg:mb-8 lg:h-32 lg:w-32">
        <div className="text-xs text-gray-400">QR Code</div>
      </div>

      {/* 기능 설명 */}
      <div className="space-y-3 text-xs text-white lg:space-y-4 lg:text-sm">
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span>내 아이 건강 정보를 입력한 후, 필요한 케어를 받을 수 있어요</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span>지역별 소아 전문 병원을 확인한 후, 관리, 진료 안내 등을 받을 수 있어요</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2">•</span>
          <span>맘편한에서만 만날 수 있는 우리 아이 정책 정보 제공 서비스</span>
        </div>
      </div>
    </div>
  )
}

export default PromotionPanel
